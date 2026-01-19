import type { KnowledgeGraph } from '../types'

export const mockGraph: KnowledgeGraph = {
  nodes: [
    // Classes
    { id: 'class-101', label: 'Math 101', type: 'class' },
    { id: 'class-102', label: 'Physics 102', type: 'class' },
    { id: 'class-201', label: 'Chemistry 201', type: 'class' },

    // Teachers
    { id: 'teacher-1', label: 'Dr. Smith', type: 'teacher' },
    { id: 'teacher-2', label: 'Prof. Johnson', type: 'teacher' },
    { id: 'teacher-3', label: 'Dr. Williams', type: 'teacher' },

    // Students
    { id: 'student-1', label: 'Alice', type: 'student' },
    { id: 'student-2', label: 'Bob', type: 'student' },
    { id: 'student-3', label: 'Charlie', type: 'student' },
    { id: 'student-4', label: 'Diana', type: 'student' },
    { id: 'student-5', label: 'Eve', type: 'student' },
    { id: 'student-6', label: 'Frank', type: 'student' },

    // Departments
    { id: 'dept-science', label: 'Science Dept', type: 'department' },
    { id: 'dept-math', label: 'Math Dept', type: 'department' },
  ],
  edges: [
    // Teachers assigned to classes
    { id: 'e1', source: 'teacher-1', target: 'class-101', relationship: 'teaches' },
    { id: 'e2', source: 'teacher-2', target: 'class-102', relationship: 'teaches' },
    { id: 'e3', source: 'teacher-3', target: 'class-201', relationship: 'teaches' },
    { id: 'e4', source: 'teacher-1', target: 'class-201', relationship: 'teaches' },

    // Students enrolled in classes
    { id: 'e5', source: 'student-1', target: 'class-101', relationship: 'enrolled_in' },
    { id: 'e6', source: 'student-1', target: 'class-102', relationship: 'enrolled_in' },
    { id: 'e7', source: 'student-2', target: 'class-101', relationship: 'enrolled_in' },
    { id: 'e8', source: 'student-3', target: 'class-102', relationship: 'enrolled_in' },
    { id: 'e9', source: 'student-3', target: 'class-201', relationship: 'enrolled_in' },
    { id: 'e10', source: 'student-4', target: 'class-201', relationship: 'enrolled_in' },
    { id: 'e11', source: 'student-5', target: 'class-101', relationship: 'enrolled_in' },
    { id: 'e12', source: 'student-6', target: 'class-102', relationship: 'enrolled_in' },

    // Departments contain classes
    { id: 'e13', source: 'dept-math', target: 'class-101', relationship: 'offers' },
    { id: 'e14', source: 'dept-science', target: 'class-102', relationship: 'offers' },
    { id: 'e15', source: 'dept-science', target: 'class-201', relationship: 'offers' },

    // Teachers belong to departments
    { id: 'e16', source: 'teacher-1', target: 'dept-math', relationship: 'belongs_to' },
    { id: 'e17', source: 'teacher-2', target: 'dept-science', relationship: 'belongs_to' },
    { id: 'e18', source: 'teacher-3', target: 'dept-science', relationship: 'belongs_to' },
  ],
}

export const availableRelationships = [
  'teaches',
  'enrolled_in',
  'offers',
  'belongs_to',
]
