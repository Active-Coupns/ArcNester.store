import { supabase } from '../lib/supabaseClient';

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://house-plans-portal.vercel.app';

  let plans = [];
  try {
    const { data, error } = await supabase
      .from('house_plans')
      .select('plan_id, created_at');
    
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
  const planRoutes = plans.map((plan) => ({
    url: `${baseUrl}/plans/${plan.plan_id}`,
    lastModified: plan.created_at ? new Date(plan.created_at) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticRoutes, ...planRoutes];
}
