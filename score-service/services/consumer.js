const { consume, publish } = require("../../pubsub");
const mongoose = require("mongoose");
require('./database.js')
const circuitBreaker = require("./circuit-breaker");

const Target = mongoose.model('Target');
const Score = mongoose.model('Score');
const Register = mongoose.model('Register');

const fs = require('fs');
const path = require('path');

async function startConsumers() {
    await consume('submission.events', async (msg) => {
        if (msg.type === 'submission.created') {
            try {
                const submission = msg.data;
                const photoUrl = submission.photoUrl;

                const uploadsDir = path.join(__dirname, '../../public/uploads');
                const target = await Target.findOne({ _id: submission.targetId });
                if(!target) return;

                const targetBuffer = fs.readFileSync(path.join(uploadsDir, target.photoUrl));
                const submissionBuffer = fs.readFileSync(path.join(uploadsDir, photoUrl));

                const targetFormData = new FormData();
                targetFormData.append('image', new Blob([targetBuffer]), { filename: target.photoUrl });

                const submissionFormData = new FormData();
                submissionFormData.append('image', new Blob([submissionBuffer]), { filename: photoUrl });

                const [submissionResult, targetResult] = await Promise.all([
                    circuitBreaker.fire(
                        "POST",
                        process.env.IMAGGA_BASE_URL,
                        'tags',
                        targetFormData,
                        { authorization: process.env.IMAGGA_AUTH }
                    ),
                    circuitBreaker.fire(
                        "POST",
                        process.env.IMAGGA_BASE_URL,
                        'tags',
                        submissionFormData,
                        { authorization: process.env.IMAGGA_AUTH }
                    )
                ]);

                if (submissionResult.status !== 200) {
                    throw new Error(`Imagga API error on submission image. Status: ${submissionResult.status}`);
                }
                if (targetResult.status !== 200) {
                    throw new Error(`Imagga API error on target image. Status: ${targetResult.status}`);
                }

                const submissionTags = submissionResult.json.result.tags;
                const targetTags = targetResult.json.result.tags;

                const score = calculateScore(submissionTags, targetTags);

                
                const scoreModel = await Score.create({
                    targetId: submission.targetId,
                    submissionId: submission._id,
                    userUid: submission.userUid,
                    score: score
                });

                if(scoreModel){
                    await publish('score.events', {
                        type: 'score.created',
                        data:{
                        photoUrl,
                        userUid: submission.userUid,
                        score,
                        targetId: submission.targetId
                        }
                    });
                }
            } catch (error) {
                console.error("Error calculating score:", error);
            }
        }
    });
    await consume('target.events', async (msg) => {
        if (msg.type === 'target.created') {
            try {
                await Target.create({ _id: msg.data.id, photoUrl: msg.data.photoUrl, organizerId: msg.data.organizerId });
            } catch (error) {
                console.error("Error saving target creation:", error);
            }
        }
        if (msg.type === 'target.deleted') {
            try {
                await Target.deleteOne({ _id: msg.data._id });
            } catch (error) {
                console.error("Error saving target deletion:", error);
            }
        }
    });
    await consume('register.events', async (msg) => {
        if (msg.type === 'register.created') {
            try {
                await Register.create({ targetId: msg.data.targetId, userUid: msg.data.userUid });
            } catch (error) {
                console.error("Error saving register creation:", error);
            }
        }
        if (msg.type === 'register.deleted') {
            try {
                await Register.deleteOne({ _id: msg.data.id });
            } catch (error) {
                console.error("Error saving register deletion:", error);
            }
        }
    });
}

function calculateScore(submissionTags, targetTags) {
    const targetTagsMap = {}; // Map all confidence scores of target tags for quick lookup
    for (const { tag, confidence } of targetTags) {
        targetTagsMap[tag.en] = confidence;
    }

    let score = 0;
    let totalSubmissionScore = 0;

    for (const { tag, confidence } of submissionTags) {
        totalSubmissionScore += confidence;
        if (targetTagsMap[tag.en]) {
            score += (confidence + targetTagsMap[tag.en]) / 2; // Average score
        }
    }

    return totalSubmissionScore > 0 ? Math.round((score / totalSubmissionScore) * 100) : 0;
}

module.exports = startConsumers;