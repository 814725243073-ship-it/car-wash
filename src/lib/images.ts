// High-resolution automotive detailing visual assets generated for AURA Hydro Detailing
import heroImage from '../assets/images/hero_car_wash_studio_1790269842777.jpg';
import exteriorFoamImage from '../assets/images/service_exterior_foam_1790269862826.jpg';
import interiorDetailImage from '../assets/images/service_interior_detail_1790269878476.jpg';
import ceramicPolishImage from '../assets/images/service_ceramic_polish_1790269892451.jpg';
import aboutFacilityImage from '../assets/images/about_wash_bay_1790269908042.jpg';

export const IMAGES = {
  hero: heroImage,
  serviceExterior: exteriorFoamImage,
  serviceInterior: interiorDetailImage,
  serviceCeramic: ceramicPolishImage,
  aboutFacility: aboutFacilityImage,
  // Default fallback for any newly added service
  defaultService: exteriorFoamImage,
};

/**
 * Maps any service name to the most fitting curated image, with a sensible fallback.
 */
export function getServiceImage(serviceName: string): string {
  const normalized = (serviceName || '').toLowerCase();

  if (
    normalized.includes('interior') ||
    normalized.includes('cabin') ||
    normalized.includes('leather') ||
    normalized.includes('vacuum') ||
    normalized.includes('upholstery') ||
    normalized.includes('steam')
  ) {
    return IMAGES.serviceInterior;
  }

  if (
    normalized.includes('wax') ||
    normalized.includes('ceramic') ||
    normalized.includes('polish') ||
    normalized.includes('coat') ||
    normalized.includes('buff') ||
    normalized.includes('sealant') ||
    normalized.includes('paint correction')
  ) {
    return IMAGES.serviceCeramic;
  }

  if (
    normalized.includes('exterior') ||
    normalized.includes('foam') ||
    normalized.includes('wash') ||
    normalized.includes('rinse') ||
    normalized.includes('hydro') ||
    normalized.includes('pressure')
  ) {
    return IMAGES.serviceExterior;
  }

  return IMAGES.defaultService;
}
