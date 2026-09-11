// Partner laboratories used by the demo. In production these would come from
// a LabPartner collection managed by the admin module.
export const PARTNER_LABS = [
  { name: 'MedServe Diagnostics', city: 'Ikeja, Lagos', state: 'Lagos', address: '15 Allen Avenue, Ikeja', phone: '+234 901 234 5678' },
  { name: 'LagosHealth Lab', city: 'Victoria Island, Lagos', state: 'Lagos', address: '4 Adeola Odeku Street, VI', phone: '+234 901 234 5679' },
  { name: 'Abuja Trust Labs', city: 'Wuse, Abuja', state: 'FCT', address: '21 Aminu Kano Crescent, Wuse II', phone: '+234 901 234 5680' },
  { name: 'Ibadan City Diagnostics', city: 'Bodija, Ibadan', state: 'Oyo', address: '8 Awolowo Road, Bodija', phone: '+234 901 234 5681' },
  { name: 'PortHarbour Medical Lab', city: 'GRA Phase II, Port Harcourt', state: 'Rivers', address: '3 Tombia Street, GRA II', phone: '+234 901 234 5682' },
];

// Partner pharmacies for medication fulfilment.
export const PARTNER_PHARMACIES = [
  { name: 'CityCare Pharmacy', city: 'Lekki, Lagos', state: 'Lagos', address: '23 Admiralty Way, Lekki Phase 1', phone: '+234 901 234 5690' },
  { name: 'Wellspring Chemist', city: 'Ikoyi, Lagos', state: 'Lagos', address: '9 Bourdillon Road, Ikoyi', phone: '+234 901 234 5691' },
  { name: 'TrustPoint Pharmacy', city: 'Wuse, Abuja', state: 'FCT', address: '16 Adetokunbo Ademola Crescent', phone: '+234 901 234 5692' },
  { name: 'Bodija Remedies', city: 'Bodija, Ibadan', state: 'Oyo', address: '31 Oyo Road, Bodija', phone: '+234 901 234 5693' },
  { name: 'Garden City Pharmacy', city: 'GRA, Port Harcourt', state: 'Rivers', address: '5 Forces Avenue, GRA', phone: '+234 901 234 5694' },
];

// Indicative retail prices in Naira used to build a pharmacy basket. In
// production, live stock + prices come from the partner pharmacy.
export const DRUG_PRICES = {
  Amlodipine: 850,
  'Adapalene 0.1% gel': 6500,
  'Benzoyl peroxide 4% wash': 4200,
  Sumatriptan: 5200,
  'Vitamin B2 (riboflavin)': 1500,
  Paracetamol: 350,
  'Artemether/Lumefantrine': 3800,
  Metformin: 1200,
  'Lisinopril': 1400,
};

export const drugPrice = (name) => {
  const found = DRUG_PRICES[name];
  if (found) return found;
  for (const key of Object.keys(DRUG_PRICES)) {
    if (key && name && name.toLowerCase().includes(key.toLowerCase())) return DRUG_PRICES[key];
  }
  return 1000;
};