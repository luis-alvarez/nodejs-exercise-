import { apiMock } from './support/apiMock.js';
import { emptyDatabase } from '../../support/database/DatabaseRepository.js';
import { expect } from 'chai';
import { readFileFromPath } from '../../support/helper.js';
import { showSeeder } from './support/showSeeder.js';

import { PrismaClient } from '@prisma/client';

import { Scheduler } from '../../../services/show/scheduler.js';

import _ from 'lodash';

describe('Shows scheduler', () => {
  context('example 1', () => {
    const needsUpdatingEx1 = [1, 2];
    let scheduler;
    
    before(async () => {
      const prisma = new PrismaClient();
      const showsRepository = prisma.show;
      scheduler = new Scheduler(showsRepository);

      await emptyDatabase();
      await showSeeder({ filename: 'example1' });
      apiMock({ filename: 'example1' });
    });

    it('finds the IDs that need updating', async () => {
      const result = await scheduler.getUpdatedShowIds(); // replace with actual call
      expect(result).to.deep.equal(needsUpdatingEx1);
    });

    it('creates the update schedule', async () => {
      const expectedSchedule = {1: 0, 2: 15};
      const scheduled = await scheduler.getUpdateSchedule(); // replace with actual call
      expect(scheduled).to.deep.equal(expectedSchedule); // replace with expected schedule
    });
  });

  context('example 2', () => {
    const needsUpdatingEx2 = [2, 4];
    let scheduler;

    before(async () => {
      const prisma = new PrismaClient();
      const showsRepository = prisma.show;
      scheduler = new Scheduler(showsRepository);

      await emptyDatabase();
      await showSeeder({ filename: 'example2' });
      apiMock({ filename: 'example2' });
    });

    it('finds the IDs that need updating', async () => {
      const result = await scheduler.getUpdatedShowIds(); // replace with actual call
      expect(result).to.deep.equal(needsUpdatingEx2);
    });

    it('creates the update schedule', async () => {
      const expectedSchedule = {2: 0, 4: 15};
      const scheduled = await scheduler.getUpdateSchedule(); // replace with actual call
      expect(scheduled).to.deep.equal(expectedSchedule); // replace with expected schedule
    });
  });

  context('example 3', () => {
    const needsUpdatingEx3 = readFileFromPath({ path: 'test/services/show/support/fixtures/example3-updates.txt' })
      .split('\n')
      .filter(Boolean)
      .map(Number);
    let scheduler;

    before(async () => {
      const prisma = new PrismaClient();
      const showsRepository = prisma.show;
      scheduler = new Scheduler(showsRepository);

      await emptyDatabase();
      await showSeeder({ filename: 'example3' });
      apiMock({ filename: 'example3' });
    });

    it('finds the IDs that need updating', async () => {
      const result = await scheduler.getUpdatedShowIds();

      const difference = _.difference(needsUpdatingEx3, result);

      expect(difference).to.be.empty;
      expect(result).to.deep.equal(needsUpdatingEx3);
    });

    it('creates the update schedule', async () => {
      const needsUpdatingEx3 = readFileFromPath({ path: 'test/services/show/support/fixtures/example3-updates.txt' })
        .split('\n')
        .filter(Boolean) //filter was missing, adding an extra id = 0 show
        .map(Number);

      const updatesCount = needsUpdatingEx3.length;

      // Given the file has more than 240 (max amount if we span a request every 15 seconds in an hour) 
      // ids that need to be updated, we'll send them in a shorter period
      const expectedTimeSpacing = 3600 / updatesCount; 

      const expectedSchedule = needsUpdatingEx3.map((id, index) => {
        return {
          id: id,
          updateTime: Math.floor(index * expectedTimeSpacing)
        }
      }).reduce((prev, current) => {
        prev[current.id] = current.updateTime;
        return prev;
      }, {});

      const scheduled = await scheduler.getUpdateSchedule(); // replace with actual call
      expect(scheduled).to.deep.equal(expectedSchedule); // replace with expected schedule
    });
  });
});
