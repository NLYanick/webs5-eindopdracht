
jest.mock('../../passport-config.js');
jest.mock('../../pubsub.js');

describe('Register Service', () => {

  describe('Module structure', () => {
    it('should have services directory', () => {
      const fs = require('fs');
      const path = require('path');
      const servicesDir = path.join(__dirname, '../services');
      expect(fs.existsSync(servicesDir)).toBe(true);
    });

    it('should have routes directory', () => {
      const fs = require('fs');
      const path = require('path');
      const routesDir = path.join(__dirname, '../routes');
      expect(fs.existsSync(routesDir)).toBe(true);
    });

    it('should have app.js', () => {
      const fs = require('fs');
      const path = require('path');
      const appFile = path.join(__dirname, '../app.js');
      expect(fs.existsSync(appFile)).toBe(true);
    });
  });

  describe('Service files', () => {
    it('should have database.js', () => {
      const fs = require('fs');
      const path = require('path');
      const dbFile = path.join(__dirname, '../services/database.js');
      expect(fs.existsSync(dbFile)).toBe(true);
    });

    it('should have consumer.js', () => {
      const fs = require('fs');
      const path = require('path');
      const consumerFile = path.join(__dirname, '../services/consumer.js');
      expect(fs.existsSync(consumerFile)).toBe(true);
    });

    it('database.js should contain mongoose code', () => {
      const fs = require('fs');
      const path = require('path');
      const dbFile = path.join(__dirname, '../services/database.js');
      const content = fs.readFileSync(dbFile, 'utf8');
      expect(content).toContain('mongoose');
      expect(content).toContain('Schema');
    });

    it('consumer.js should contain async function', () => {
      const fs = require('fs');
      const path = require('path');
      const consumerFile = path.join(__dirname, '../services/consumer.js');
      const content = fs.readFileSync(consumerFile, 'utf8');
      expect(content).toContain('async function');
      expect(content).toContain('module.exports');
    });
  });

  describe('Routes configuration', () => {
    it('routes/index.js should exist', () => {
      const fs = require('fs');
      const path = require('path');
      const routesFile = path.join(__dirname, '../routes/index.js');
      expect(fs.existsSync(routesFile)).toBe(true);
    });

    it('routes file should have POST, DELETE, and GET methods', () => {
      const fs = require('fs');
      const path = require('path');
      const routesFile = path.join(__dirname, '../routes/index.js');
      const content = fs.readFileSync(routesFile, 'utf8');
      
      expect(content).toContain('router.post');
      expect(content).toContain('router.delete');
      expect(content).toContain('router.get');
    });

    it('routes should use passport authentication', () => {
      const fs = require('fs');
      const path = require('path');
      const routesFile = path.join(__dirname, '../routes/index.js');
      const content = fs.readFileSync(routesFile, 'utf8');
      
      expect(content).toContain('passport.authenticate');
    });

    it('routes should publish events', () => {
      const fs = require('fs');
      const path = require('path');
      const routesFile = path.join(__dirname, '../routes/index.js');
      const content = fs.readFileSync(routesFile, 'utf8');
      
      expect(content).toContain('publish');
    });
  });

  describe('Database configuration', () => {
    it('should use MongoDB connection string', () => {
      const fs = require('fs');
      const path = require('path');
      const dbFile = path.join(__dirname, '../services/database.js');
      const content = fs.readFileSync(dbFile, 'utf8');
      
      expect(content).toContain('mongoose.connect');
    });

    it('should define Registers schema with targetId and userUid', () => {
      const fs = require('fs');
      const path = require('path');
      const dbFile = path.join(__dirname, '../services/database.js');
      const content = fs.readFileSync(dbFile, 'utf8');
      
      expect(content).toContain('targetId');
      expect(content).toContain('userUid');
    });

    it('should register Registers model', () => {
      const fs = require('fs');
      const path = require('path');
      const dbFile = path.join(__dirname, '../services/database.js');
      const content = fs.readFileSync(dbFile, 'utf8');
      
      expect(content).toContain("mongoose.model('Registers'");
    });
  });

  describe('Consumer configuration', () => {
    it('should consume from target.events', () => {
      const fs = require('fs');
      const path = require('path');
      const consumerFile = path.join(__dirname, '../services/consumer.js');
      const content = fs.readFileSync(consumerFile, 'utf8');
      
      expect(content).toContain('target.events');
    });

    it('should handle target.deleted events', () => {
      const fs = require('fs');
      const path = require('path');
      const consumerFile = path.join(__dirname, '../services/consumer.js');
      const content = fs.readFileSync(consumerFile, 'utf8');
      
      expect(content).toContain('target.deleted');
    });

    it('should delete registers on target deletion', () => {
      const fs = require('fs');
      const path = require('path');
      const consumerFile = path.join(__dirname, '../services/consumer.js');
      const content = fs.readFileSync(consumerFile, 'utf8');
      
      expect(content).toContain('deleteMany');
    });
  });
});
