const { consume, publish } = require("../../pubsub");
const circuitBreaker = require("./circuit-breaker");

const fs = require('fs');
const path = require('path');

async function startConsumers() {
    await consume('calculate-score', async (msg) => {
        try {
            const { submission } = msg;
            const imageName = submission.imageName;

            const uploadsDir = path.join(__dirname, '../../public/uploads');

            const targetBuffer = fs.readFileSync(path.join(uploadsDir, msg.targetPhotoUrl));
            const submissionBuffer = fs.readFileSync(path.join(uploadsDir, imageName));

            const targetFormData = new FormData();
            targetFormData.append('image', new Blob([targetBuffer]), { filename: msg.targetPhotoUrl });

            const submissionFormData = new FormData();
            submissionFormData.append('image', new Blob([submissionBuffer]), { filename: imageName });

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

            await publish('update-score', {
                imageName,
                score,
                targetId: submission.targetId
            });

            await publish('mail-score', {
                imageName,
                userUid: submission.userUid,
                score,
                targetId: submission.targetId
            });
        } catch (error) {
            console.error("Error calculating score:", error);
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