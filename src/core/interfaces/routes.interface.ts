import { Router } from 'express';

export interface Routes {
  pathNested?: string;
  router: Router;
}
