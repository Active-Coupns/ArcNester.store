import PlanDetailClient from './PlanDetailClient';
import { supabase } from '../../../lib/supabaseClient';

function getPlanImages(plan) {
  if (!plan) return [];
  const imageUrls = [];
  const r2Host = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || 'https://pub-46ed75ab8f9c4aba937dfacb2ffb86e0.r2.dev';
  
  if (plan.images && typeof plan.images === 'object') {
    const sortedKeys = Object.keys(plan.images).sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
    );
    for (const key of sortedKeys) {
      const rawPath = plan.images[key];
      if (rawPath) {
        if (!rawPath.startsWith('http://') && !rawPath.startsWith('https://')) {
          const parts = rawPath.replace(/\\/g, '/').split('/');
          const imgName = parts[parts.length - 1];
          imageUrls.push(`${r2Host}/plans/${plan.category}/${plan.plan_id}/${imgName}`);
        } else {
          imageUrls.push(rawPath);
        }
      }
    }
  }
  
  if (imageUrls.length === 0) {
    imageUrls.push('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&h=630&q=80');
  }
  return imageUrls;
}

export async function generateMetadata({ params }) {
  const { plan_id } = params;
  
  try {
    const { data: plan } = await supabase
      .from('house_plans')
      .select('*')
      .eq('plan_id', plan_id)
      .single();

    if (plan) {
      const bhk = plan.bedrooms ? `${plan.bedrooms} BHK` : 'Modern';
      const square_feet = plan.square_footage || '';
      const techSpecs = plan.raw_json?.technical_specifications || {};
      const plot_size = techSpecs.plot_size || '';
      const facing = techSpecs.facing || '';

      // Format dynamic Title: {plan.plot_size} {plan.facing} {plan.bhk} House Plan ({plan.square_feet} Sq Ft) | ArcNester
      const titleParts = [];
      if (plot_size) titleParts.push(plot_size);
      if (facing) titleParts.push(facing);
      titleParts.push(bhk);
      titleParts.push("House Plan");
      if (square_feet) {
        titleParts.push(`(${square_feet} Sq Ft)`);
      }
      const title = `${titleParts.join(' ')} | ArcNester`;

      // Format dynamic Description: Download complete {plan.bhk} floor plan blueprint with {plan.plot_size} dimensions, Vastu layout, and 3D elevation renders at ArcNester.store.
      const descParts = [];
      descParts.push(`Download complete ${bhk} floor plan blueprint`);
      if (plot_size) descParts.push(`with ${plot_size} dimensions,`);
      else descParts.push("with Vastu layout,");
      descParts.push("elevation details, and 3D renders at ArcNester.store.");
      const description = descParts.join(' ');

      const images = getPlanImages(plan);
      const previewImage = images[0];

      return {
        title,
        description,
        openGraph: {
          title,
          description,
          url: `https://www.arcnester.store/plans/${plan_id}`,
          siteName: 'ArcNester.store',
          images: [
            {
              url: previewImage,
              width: 1200,
              height: 630,
              alt: `${title} 3D Exterior Elevation Render Preview`,
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

export default async function Page({ params }) {
  const { plan_id } = params;
  let plan = null;

  try {
    const { data } = await supabase
      .from('house_plans')
      .select('*')
      .eq('plan_id', plan_id)
      .single();
    plan = data;
  } catch (err) {
    console.error("Error fetching plan for structured schema data:", err);
  }

  // Generate Product JSON-LD dynamic Structured Data
  let jsonLd = null;
  if (plan) {
    const bhk = plan.bedrooms ? `${plan.bedrooms} BHK` : 'Modern';
    const square_feet = plan.square_footage || '';
    const techSpecs = plan.raw_json?.technical_specifications || {};
    const plot_size = techSpecs.plot_size || '';
    const facing = techSpecs.facing || '';
    const images = getPlanImages(plan);

    const titleParts = [];
    if (plot_size) titleParts.push(plot_size);
    if (facing) titleParts.push(facing);
    titleParts.push(bhk);
    titleParts.push("House Plan");
    if (square_feet) {
      titleParts.push(`(${square_feet} Sq Ft)`);
    }
    const fullProductName = titleParts.join(' ');

    jsonLd = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": fullProductName,
      "image": images,
      "description": plan.short_description || plan.seo_data?.short_description || `Download complete ${bhk} floor plan blueprint at ArcNester.store.`,
      "sku": plan.plan_id,
      "mpn": plan.plan_id,
      "brand": {
        "@type": "Brand",
        "name": "ArcNester"
      },
      "offers": {
        "@type": "Offer",
        "url": `https://www.arcnester.store/plans/${plan_id}`,
        "priceCurrency": "USD",
        "price": "19.99",
        "priceValidUntil": "2027-12-31",
        "itemCondition": "https://schema.org/NewCondition",
        "availability": "https://schema.org/InStock",
        "seller": {
          "@type": "Organization",
          "name": "ArcNester"
        }
      },
      "additionalProperty": [
        {
          "@type": "PropertyValue",
          "name": "Bedrooms",
          "value": plan.bedrooms
        },
        {
          "@type": "PropertyValue",
          "name": "Bathrooms",
          "value": plan.bathrooms
        },
        {
          "@type": "PropertyValue",
          "name": "Square Footage",
          "value": plan.square_footage
        }
      ]
    };

    if (plot_size) {
      jsonLd.additionalProperty.push({
        "@type": "PropertyValue",
        "name": "Plot Size",
        "value": plot_size
      });
    }

    if (facing) {
      jsonLd.additionalProperty.push({
        "@type": "PropertyValue",
        "name": "Facing",
        "value": facing
      });
    }
  }

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <PlanDetailClient params={params} />
    </>
  );
}
