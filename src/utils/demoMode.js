import { readJson, readString, writeJson, writeString } from './safeStorage'

const DEMO_MODE_KEY = 'vecta_demo_mode'
const DEMO_STATE_KEY = 'vecta_demo_state'

function clone(value) {
  return typeof structuredClone === 'function'
    ? structuredClone(value)
    : JSON.parse(JSON.stringify(value))
}

function createSeedState() {
  return {
    currentUser: {
      id: 1,
      name: 'Demo gebruiker',
      email: 'demo@vecta.local',
      subscriptionPlan: 'free',
<<<<<<< HEAD
      subscriptionStartedAt: null,
      subscriptionExpiresAt: null,
      subscriptionNextPlan: null,
      subscriptionNextStartsAt: null,
      subscriptionNextExpiresAt: null,
=======
>>>>>>> 248651e4bd9c9ce6b205dd87f3bf06d83f49a1d2
    },
    nextIds: {
      project: 2,
      group: 3,
      task: 4,
      label: 3,
      comment: 3,
      note: 3,
      member: 3,
      share: 2,
    },
    projects: [
      {
        id: 1,
        name: 'Demo project',
        description: 'Lokale demo zonder backend-account',
        color: '#5b5bd6',
        role: 'owner',
        archived: false,
        archivedAt: null,
        shareId: null,
        members: [
          {
            id: 1,
            name: 'Demo gebruiker',
            email: 'demo@vecta.local',
            role: 'owner',
            subscriptionPlan: 'free',
          },
          {
            id: 2,
            name: 'Sam Collaborator',
            email: 'sam@vecta.local',
            role: 'collaborator',
            subscriptionPlan: 'standard',
          },
        ],
        labels: [
          { id: 1, name: 'Bug', color: '#e5484d' },
          { id: 2, name: 'UX', color: '#5b5bd6' },
        ],
        backlog: [
          {
            id: 101,
            text: 'Controleer lokale hosting',
            description: 'Demo-taak in backlog',
            status: 'not_started',
            priority: 'medium',
            deadline: null,
            duration: null,
            labelIds: [2],
            assigneeIds: [],
            mainColor: null,
            color: null,
            calendarColor: null,
            comments: [],
            notes: [],
            attachments: [],
          },
        ],
        groups: [
          {
            id: 201,
            name: 'Backlog opvolgen',
            description: 'Taken die klaar zijn voor uitvoering',
            deadline: null,
            priority: 'medium',
            status: 'not_started',
            labelIds: [1],
            color: '#5b5bd6',
            mainColor: null,
            gridRow: 0,
            gridCol: 0,
            tasks: [
              {
                id: 102,
                text: 'Fix project UI bugs',
                description: '',
                status: 'in_progress',
                priority: 'high',
                deadline: null,
                duration: null,
                labelIds: [1],
                assigneeIds: [],
                mainColor: null,
                color: null,
                calendarColor: null,
                comments: [],
                notes: [],
                attachments: [],
              },
            ],
            archivedTasks: [],
          },
          {
            id: 202,
            name: 'Klaar voor review',
            description: '',
            deadline: null,
            priority: 'low',
            status: 'not_started',
            labelIds: [],
            color: '#46a758',
            mainColor: null,
            gridRow: 0,
            gridCol: 1,
            tasks: [],
            archivedTasks: [],
          },
        ],
        archivedGroups: [],
        archivedTasks: [],
        activity: [],
      },
    ],
  }
}

export function isDemoModeEnabled() {
  return readString(DEMO_MODE_KEY, '0') === '1'
}

export function setDemoModeEnabled(enabled) {
  writeString(DEMO_MODE_KEY, enabled ? '1' : '0')
}

export function readDemoState() {
  const state = readJson(DEMO_STATE_KEY, null)
  if (state && typeof state === 'object') {
    return state
  }
  return resetDemoState()
}

export function writeDemoState(state) {
  writeJson(DEMO_STATE_KEY, state)
}

export function resetDemoState() {
  const state = createSeedState()
  writeDemoState(state)
  return state
}

export function getDemoStateClone() {
  return clone(readDemoState())
}

export function getDemoUser() {
  return clone(readDemoState().currentUser)
}

export function getDemoToken() {
  return 'demo-csrf-token'
}
