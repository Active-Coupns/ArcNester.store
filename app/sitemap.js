import { supabase } from '../lib/supabaseClient';

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.arcnester.store';

  let plans = [];
  try {
    const { data, error } = await supabase
      .from('house_plans')
      .select('plan_id, category, is_published, raw_json, seo_data, created_at');
    
    if (!error && data) {
      plans = data;
    }
  } catch (err) {
    console.error("Error fetching plans for sitemap:", err);
  }

  // 1. Static Routes
  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/admin/dashboard`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    }
  ];

  // 2. Dynamic Routes for individual plans
  let counter1bhk = 0;
  const mappedPlans = plans.map(p => {
    let categoryId = '1bhk';
    const cat = p.category?.toLowerCase() || '';
    if (cat.includes('1bhk') || cat.includes('tiny')) categoryId = '1bhk';
    else if (cat.includes('2bhk')) categoryId = '2bhk';
    else if (cat.includes('3bhk')) categoryId = '3bhk';
    else if (cat.includes('villa') || cat.includes('duplex') || cat.includes('luxury') || cat.includes('spanish') || cat.includes('haveli')) categoryId = 'villas';
    else if (cat.includes('farm') || cat.includes('barn') || cat.includes('ranch') || cat.includes('a_frame')) categoryId = 'farmhouse';

    let isPub = false;
    const dbIsPublished = p.is_published !== undefined && p.is_published !== null
      ? p.is_published
      : (p.raw_json?.is_published !== undefined && p.raw_json?.is_published !== null
         ? p.raw_json.is_published
         : (p.seo_data?.is_published !== undefined && p.seo_data?.is_published !== null
            ? p.seo_data.is_published
            : null));

    if (dbIsPublished !== null) {
      isPub = dbIsPublished;
    } else {
      if (categoryId === '1bhk' && counter1bhk < 10) {
        isPub = true;
        counter1bhk++;
      }
    }

    return { ...p, isPublished: isPub };
  }).filter(p => p.isPublished);

  const planRoutes = mappedPlans.map((plan) => ({
    url: `${baseUrl}/plans/${plan.plan_id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticRoutes, ...planRoutes];
}
