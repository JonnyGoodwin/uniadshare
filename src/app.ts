import cors from '@fastify/cors';
import sensible from '@fastify/sensible';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import Fastify from 'fastify';
import type { FastifyInstance } from 'fastify';

import type { Env } from './config/env.js';
import type { Dependencies } from './deps.js';
import { createDependencies } from './deps.js';
import { registerAuthRoutes } from './routes/auth.js';
import { registerConsentRoutes } from './routes/consent.js';
import { registerDeliveryRoutes } from './routes/deliveries.js';
import { registerDisclosureRoutes } from './routes/disclosures.js';
import { registerGoogleFontRoutes } from './routes/google-fonts.js';
import { registerHealthRoutes } from './routes/health.js';
import { registerLandingRoutes } from './routes/landing.js';
import { registerLeadRoutes } from './routes/leads.js';
import { registerPodRoutes } from './routes/pods.js';
import { registerTemplateRoutes } from './routes/templates.js';

export function buildApp(env: Env, deps: Dependencies = createDependencies(env)): FastifyInstance {
  const app = Fastify({
    logger: {
      level: env.NODE_ENV === 'production' ? 'info' : 'debug'
    },
    config: env
  });
  app.decorate('config', env);

  void app.register(sensible);
  void app.register(cors, { origin: true });

  void app.register(swagger, {
    openapi: {
      info: {
        title: 'Acquisition Pods API',
        version: '0.1.0'
      }
    }
  });

  void app.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: { docExpansion: 'list' }
  });

  registerHealthRoutes(app);
  registerAuthRoutes(app);
  registerPodRoutes(app, deps.podService, deps.disclosureService);
  registerDisclosureRoutes(app, deps.disclosureService);
  registerTemplateRoutes(app);
  registerGoogleFontRoutes(app);
  registerLandingRoutes(app, deps.podService);
  registerDeliveryRoutes(app, deps.deliveryService);
  registerConsentRoutes(app, deps.leadService);
  registerLeadRoutes(app, deps.leadService, deps.disclosureService);

  return app;
}
