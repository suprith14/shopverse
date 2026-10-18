import { Router } from 'express';
import { requireAdmin } from '../middleware/auth.js';
import * as service from './content.service.js';

// Mounted at /cms

export const contentRouter = Router();

// Public: the store reads these. Browsers and Vercel's CDN may keep a copy for 60 s, then
// serve the old copy for up to 5 more minutes while fetching a fresh one in the background
// (stale-while-revalidate). So an edit shows up on the store within about a minute.
const publicCache = (res) => res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');

contentRouter.get('/content', async (_req, res) => {
  publicCache(res);
  res.json(await service.getAllContent());
});

contentRouter.get('/content/:type', async (req, res) => {
  publicCache(res);
  res.json(await service.getContent(req.params.type));
});

// Admin only: the editor in the admin app.
contentRouter.get('/admin/content', requireAdmin, async (_req, res) => {
  res.set('Cache-Control', 'no-store'); // never cache: the editor must show what's really saved
  res.json({ types: await service.getEditorContent() });
});

contentRouter.put('/admin/content/:type', requireAdmin, async (req, res) => {
  res.json(await service.saveContent(req.params.type, req.body, res.locals.user.id));
});
