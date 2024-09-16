import { MockJobCreatedEvent } from './mocks/events/mockJobCreatedEvent'
import { MockJobDeletedEvent } from './mocks/events/mockJobDeletedEvent'
import { MockJobAggregateRoot } from './mocks/domain/mockJobAggregateRoot'

import { MockJobAggregateRootId } from './mocks/domain/mockJobAggregateRootId';

import { DomainEvents } from '@shared/DomainEvents'
import { MockEventSubsciption } from './mocks/sevices/mockEventSubsciption';
import { UniqueEntityID } from '@shared/UniqueEntityID';

let eventSubscription: MockEventSubsciption;
let job: MockJobAggregateRoot;
let spy;

describe('Domain Events', () => {

  beforeEach(() => {
    eventSubscription = null;
    DomainEvents.clearHandlers();
    DomainEvents.clearMarkedAggregates();
    spy = null;
    job = null;
  })

  describe('Given a JobCreatedEvent, JobDeletedEvent and a PostToEventSubscription handler class', () => {
    it('Should be able to setup event subscriptions', () => {
      eventSubscription = new MockEventSubsciption();
      eventSubscription.setupSubscriptions();

      expect(Object.keys(DomainEvents['handlersMap']).length).toBe(2);

      expect(DomainEvents['handlersMap'][MockJobCreatedEvent.name].length).toBe(1);
      expect(DomainEvents['handlersMap'][MockJobDeletedEvent.name].length).toBe(1);
    })

    it('There should be exactly one handler subscribed to the JobCreatedEvent', () => {
      eventSubscription = new MockEventSubsciption();
      eventSubscription.setupSubscriptions();

      expect(DomainEvents['handlersMap'][MockJobCreatedEvent.name].length).toBe(1);
    })

    it('There should be exactly one handler subscribed to the JobDeletedEvent', () => {
      eventSubscription = new MockEventSubsciption();
      eventSubscription.setupSubscriptions();

      expect(DomainEvents['handlersMap'][MockJobDeletedEvent.name].length).toBe(1);
    })

    it('Should add the event to the DomainEvents list when the event is created', async () => {
      MockJobAggregateRoot.createJob({}, MockJobAggregateRootId);
      eventSubscription = new MockEventSubsciption();
      eventSubscription.setupSubscriptions();

      expect(DomainEvents['markedAggregates']['length']).toBe(1);
      expect(DomainEvents['markedAggregates'][0].domainEvents.length).toBe(1);
    });

    it('Should remove the marked aggregate from the marked aggregates list after it gets dispatched', () => {
      eventSubscription = new MockEventSubsciption();
      eventSubscription.setupSubscriptions();

      // Create the event, mark the aggregate
      job = MockJobAggregateRoot.createJob({}, MockJobAggregateRootId);

      expect(DomainEvents['markedAggregates']['length']).toBe(1);

      // Dispatch the events now
      DomainEvents.dispatchEventsForAggregate(MockJobAggregateRootId);

      expect(DomainEvents['markedAggregates']['length']).toBe(0);
    });

    it('Should only add the domain event to the ', () => {
      eventSubscription = new MockEventSubsciption();
      // Create listeners
      eventSubscription.setupSubscriptions();

      // Must have 2 listeners, MockJobCreatedEvent & MockJobDeletedEvent
      expect(Object.keys(DomainEvents['handlersMap']).length).toBe(2);
      expect(DomainEvents['handlersMap'][MockJobCreatedEvent.name].length).toBe(1);
      expect(DomainEvents['handlersMap'][MockJobDeletedEvent.name].length).toBe(1);

      // Create the event, mark the aggregate
      MockJobAggregateRoot.createJob({}, new UniqueEntityID('99'));
      expect(DomainEvents['markedAggregates']['length']).toBe(1);

      // Create a new job, it should also get marked
      job = MockJobAggregateRoot.createJob({}, new UniqueEntityID('12'));
      expect(DomainEvents['markedAggregates']['length']).toBe(2);

      // Dispatch another action from the second job created
      job.deleteJob();

      // The number of aggregates should be the same
      expect(DomainEvents['markedAggregates']['length']).toBe(2);

      // However, the second aggregate should have two events now
      expect(DomainEvents['markedAggregates'][1].domainEvents.length).toBe(2);

      // And the first aggregate should have one event
      expect(DomainEvents['markedAggregates'][0].domainEvents.length).toBe(1);

      // Dispatch the event for the first job
      DomainEvents.dispatchEventsForAggregate(new UniqueEntityID('99'));
      expect(DomainEvents['markedAggregates']['length']).toBe(1);
      
      // The job with two events should still be there
      expect(DomainEvents['markedAggregates'][0].domainEvents.length).toBe(2);

      // Dispatch the event for the second job
      DomainEvents.dispatchEventsForAggregate(new UniqueEntityID('12'));

      // There should be no more domain events in the list
      expect(DomainEvents['markedAggregates']['length']).toBe(0);
    })
  });
});
