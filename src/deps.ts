import type { Env } from './config/env.js';
import { InMemoryPodRepository } from './infra/memory/pod-repo.js';
import { InMemoryDeliveryQueue } from './infra/memory/delivery-queue.js';
import { InMemoryDisclosureRepository } from './infra/memory/disclosure-repo.js';
import { InMemoryLeadRepository } from './infra/memory/lead-repo.js';
import { InMemorySuppressionService } from './infra/memory/suppression-service.js';
import { InMemoryWebhookAdapter } from './infra/memory/webhook-adapter.js';
import { PrismaPodRepository } from './infra/prisma/pod-repo.js';
import { PrismaDeliveryQueue } from './infra/prisma/delivery-queue.js';
import { PrismaDisclosureRepository } from './infra/prisma/disclosure-repo.js';
import { PrismaLeadRepository } from './infra/prisma/lead-repo.js';
import { PrismaSuppressionService } from './infra/prisma/suppression-service.js';
import { FetchWebhookAdapter } from './infra/webhook/fetch-adapter.js';
import { PodService } from './services/pod-service.js';
import { DeliveryService } from './services/delivery-service.js';
import { DisclosureService } from './services/disclosure-service.js';
import { LeadService } from './services/lead-service.js';

export type Dependencies = {
  leadService: LeadService;
  podService: PodService;
  disclosureService: DisclosureService;
  deliveryService: DeliveryService;
};

export function createDependencies(env: Env): Dependencies {
  const leadRepo =
    env.NODE_ENV === 'test' || !env.DATABASE_URL
      ? new InMemoryLeadRepository()
      : new PrismaLeadRepository();
  const disclosureRepo =
    env.NODE_ENV === 'test' || !env.DATABASE_URL
      ? new InMemoryDisclosureRepository()
      : new PrismaDisclosureRepository();
  const podRepo =
    env.NODE_ENV === 'test' || !env.DATABASE_URL
      ? new InMemoryPodRepository()
      : new PrismaPodRepository();
  const deliveryQueue =
    env.NODE_ENV === 'test' || !env.DATABASE_URL
      ? new InMemoryDeliveryQueue()
      : new PrismaDeliveryQueue();
  const suppressionService =
    env.NODE_ENV === 'test' || !env.DATABASE_URL
      ? new InMemorySuppressionService()
      : new PrismaSuppressionService();
  const webhookAdapter =
    env.NODE_ENV === 'test' || !env.DATABASE_URL
      ? new InMemoryWebhookAdapter()
      : new FetchWebhookAdapter();
  const disclosureService = new DisclosureService(disclosureRepo);
  const podService = new PodService(podRepo, disclosureService);
  const deliveryService = new DeliveryService(
    deliveryQueue,
    suppressionService,
    webhookAdapter,
    env.WEBHOOK_DEFAULT_ENDPOINT
  );

  return {
    leadService: new LeadService(leadRepo, disclosureService, deliveryService, podService),
    podService,
    disclosureService,
    deliveryService
  };
}
