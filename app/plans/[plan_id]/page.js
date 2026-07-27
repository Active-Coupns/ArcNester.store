import PlanDetailClient from './PlanDetailClient';
import { supabase } from '../../../lib/supabaseClient';

export async function generateMetadata({ params }) {
  const { plan_id } = params;
  
  try {
    const { data: plan } = await supabase
      .from('house_plans')
      .select('*')
      .eq('plan_id', plan_id)
      .single();

    if (plan) {
      const title = `${plan.title} | ${plan.bedrooms} BHK ${plan.square_footage} Sq Ft House Plan`;
      const description = plan.short_description || `Premium floor plan details for ${plan.title}. Features: ${plan.bedrooms} BHK, ${plan.bathrooms} Bathrooms, ${plan.square_footage} Sq Ft built-up area.`;
      
      // Calculate preview image URL
      let previewImage = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&h=630&q=80';
      if (plan.images && typeof plan.images === 'object') {
        const sortedKeys = Object.keys(plan.images).sort((a, b) =>
          a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
        );
        const firstKey = sortedKeys[0];
        const rawPath = plan.images[firstKey];
        if (rawPath) {
          const r2Host = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || 'https://pub-46ed75ab8f9c4aba937dfacb2ffb86e0.r2.dev';
          if (!rawPath.startsWith('http://') && !rawPath.startsWith('https://')) {
            const parts = rawPath.replace(/\\/g, '/').split('/');
            const imgName = parts[parts.length - 1];
            previewImage = `${r2Host}/plans/${plan.category}/${plan.plan_id}/${imgName}`;
          } else {
            previewImage = rawPath;
          }
        }
      }

      return {
        title,
        description,
        openGraph: {
          title,
          description,
          url: `https://house-plans-portal.vercel.app/plans/${plan_id}`,
          siteName: 'ArcNester.store',
          images: [
            {
              url: previewImage,
              width: 800,
              height: 600,
              alt: `${plan.title} 3D Exterior Render Preview`,
            }
          ],
          locale: 'en_US',
          type: 'article',
        },
        twitter: {
          card: 'summary_large_image',
          title,
          description,
          images: [previewImage],
        }
      };
    }
  } catch (err) {
    console.error("Error generating metadata:", err);
  }

  return {
    title: 'ArcNester.store | Premium Architectural House Plans',
    description: 'Download premium architectural concept drawings, 3D renders, and floor plans.',
  };
}

export default function Page({ params }) {
  return <PlanDetailClient params={params} />;
}
