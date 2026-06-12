const PLAN_LIST = [
  {
    key: 'free',
    name: 'Free',
    subtitle: 'Base plan',
    price: '0.00 dabloons p/maand',
    priceShort: '0.00 dabloons',
    rolesEnabled: false,
    durationDays: null,
    limits: {
      projects: 1,
      groups: 5,
      archivedGroups: 10,
      collaborators: 2,
      planningWindow: '1 week vooruit',
    },
    features: [
      '1 project',
      'Geen rollen',
      'Max 5 groepen',
      'Max 10 archived groepen',
      'Max 2 collaborateurs',
      'Max 1 week vooruit plannen',
    ],
  },
  {
    key: 'standard',
    name: 'Standard',
    subtitle: 'Voor kleine teams',
    price: '100 dabloons p/maand',
    priceShort: '100 dabloons',
    rolesEnabled: false,
    durationDays: 30,
    limits: {
      projects: 2,
      groups: 10,
      archivedGroups: 25,
      collaborators: 5,
      planningWindow: '2 weken vooruit',
    },
    features: [
      '2 projecten',
      'Geen rollen',
      'Max 10 groepen',
      'Max 25 archived groepen',
      'Max 5 collaborateurs',
      'Max 2 weken vooruit plannen',
    ],
  },
  {
    key: 'premium',
    name: 'Premium',
    subtitle: 'Meer ruimte voor groei',
    price: '250 dabloons p/maand',
    priceShort: '250 dabloons',
    rolesEnabled: false,
    durationDays: 30,
    limits: {
      projects: 5,
      groups: 15,
      archivedGroups: 50,
      collaborators: 10,
      planningWindow: '1 maand vooruit',
    },
    features: [
      '5 projecten',
      'Geen rollen',
      'Max 15 groepen',
      'Max 50 archived',
      'Max 10 collaborateurs',
      'Max 1 maand vooruit plannen',
    ],
  },
  {
    key: 'premium_plus',
    name: 'Premium+',
    subtitle: 'Rollen aan',
    price: '500 dabloons p/maand',
    priceShort: '500 dabloons',
    rolesEnabled: true,
    durationDays: 30,
    limits: {
      projects: 10,
      groups: 20,
      archivedGroups: 100,
      collaborators: 20,
      planningWindow: '1 kwartaal vooruit',
    },
    features: [
      '10 projecten',
      'Rollen',
      'Max 20 groepen',
      'Max 100 archived',
      'Max 20 collaborateurs',
      'Max 1 kwartaal vooruit plannen',
    ],
  },
  {
    key: 'enterprise',
    name: 'Enterprise',
    subtitle: 'Per user',
    price: '500 dabloons p/user',
    priceShort: '500 dabloons p/user',
    rolesEnabled: true,
    durationDays: 30,
    limits: {
      projects: Infinity,
      groups: Infinity,
      archivedGroups: Infinity,
      collaborators: Infinity,
      planningWindow: 'infinite vooruit',
      minUsers: 10,
    },
    features: [
      'Min 10 users',
      'Infinite projecten',
      'Rollen',
      'Infinite groepen',
      'Infinite archived dingen',
      'Infinite collaborateurs',
      'Infinite vooruit plannen',
    ],
  },
]

const PLAN_BY_KEY = Object.fromEntries(PLAN_LIST.map((plan) => [plan.key, plan]))

export function getPlan(key = 'free') {
  return PLAN_BY_KEY[key] || PLAN_BY_KEY.free
}

export function getPlanList() {
  return PLAN_LIST
}

export function getPlanLabel(key = 'free') {
  const plan = getPlan(key)
  return plan.name
}

export function getPlanPrice(key = 'free') {
  return getPlan(key).price
}

export function canUseRoles(key = 'free') {
  return !!getPlan(key).rolesEnabled
}

export function formatLimit(value) {
  return value === Infinity ? 'onbeperkt' : String(value)
}
