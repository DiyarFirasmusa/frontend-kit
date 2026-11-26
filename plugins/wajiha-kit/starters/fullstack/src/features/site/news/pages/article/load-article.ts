import { notFound } from '@tanstack/react-router';
import { findArticle } from '../../data/articles';

/**
 * Route loader. An unknown slug is a real 404 (never a "not found" text with status 200).
 * Returns only the slug: the data is read again by the page hook, so nothing large is serialized twice.
 */
export function loadArticle(slug: string): { slug: string } {
  if (findArticle(slug) === undefined) {
    throw notFound();
  }
  return { slug };
}
