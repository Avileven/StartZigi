"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import InAppPromotion from '@/components/promotions/InAppPromotion';
import EmailPromotion from '@/components/promotions/EmailPromotion';
import { createPageUrl } from '@/utils';

export default function Promotion() {
  const router = useRouter();
  const [promotionType, setPromotionType] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get('type');
    setPromotionType(type);
    
    if (!type) {
      router.push(createPageUrl('PromotionCenter'));
    }
  }, [router]);

  const goBack = () => {
    router.push(createPageUrl('PromotionCenter'));
  };

  if (promotionType === 'in-app') {
    return <InAppPromotion goBack={goBack} />;
  }

  if (promotionType === 'email') {
    return <EmailPromotion goBack={goBack} />;
  }

  return null;
}