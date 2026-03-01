import type { KnowledgeGraph } from '../types'

export const mockGraph: KnowledgeGraph = {
  nodes: [
    // Departments (3)
    { id: 'dept-cs', label: 'Computer Science', type: 'Department' },
    { id: 'dept-math', label: 'Mathematics', type: 'Department' },
    { id: 'dept-phys', label: 'Physics', type: 'Department' },

    // Professors (6, 2 per department)
    { id: 'prof-alice', label: 'Prof. Alice', type: 'Professor', metadata: { dept: 'cs' } },
    { id: 'prof-bob', label: 'Prof. Bob', type: 'Professor', metadata: { dept: 'cs' } },
    { id: 'prof-carol', label: 'Prof. Carol', type: 'Professor', metadata: { dept: 'math' } },
    { id: 'prof-dave', label: 'Prof. Dave', type: 'Professor', metadata: { dept: 'math' } },
    { id: 'prof-eve', label: 'Prof. Eve', type: 'Professor', metadata: { dept: 'phys' } },
    { id: 'prof-frank', label: 'Prof. Frank', type: 'Professor', metadata: { dept: 'phys' } },

    // Courses (8)
    { id: 'course-algo', label: 'Algorithms', type: 'Course' },
    { id: 'course-ml', label: 'Machine Learning', type: 'Course' },
    { id: 'course-db', label: 'Databases', type: 'Course' },
    { id: 'course-calculus', label: 'Calculus', type: 'Course' },
    { id: 'course-linalg', label: 'Linear Algebra', type: 'Course' },
    { id: 'course-stats', label: 'Statistics', type: 'Course' },
    { id: 'course-quantum', label: 'Quantum Mechanics', type: 'Course' },
    { id: 'course-thermo', label: 'Thermodynamics', type: 'Course' },

    // Students (12)
    { id: 'stu-1', label: 'Alice S.', type: 'Student' },
    { id: 'stu-2', label: 'Bob S.', type: 'Student' },
    { id: 'stu-3', label: 'Carol S.', type: 'Student' },
    { id: 'stu-4', label: 'Dave S.', type: 'Student' },
    { id: 'stu-5', label: 'Eve S.', type: 'Student' },
    { id: 'stu-6', label: 'Frank S.', type: 'Student' },
    { id: 'stu-7', label: 'Grace S.', type: 'Student' },
    { id: 'stu-8', label: 'Hank S.', type: 'Student' },
    { id: 'stu-9', label: 'Iris S.', type: 'Student' },
    { id: 'stu-10', label: 'Jack S.', type: 'Student' },
    { id: 'stu-11', label: 'Kate S.', type: 'Student' },
    { id: 'stu-12', label: 'Leo S.', type: 'Student' },
  ],
  edges: [
    // Department → Professor (has_faculty)
    { id: 'e-cs-hf-alice', source: 'dept-cs', target: 'prof-alice', relationship: 'has_faculty', inverseRelationship: 'member_of_faculty' },
    { id: 'e-cs-hf-bob', source: 'dept-cs', target: 'prof-bob', relationship: 'has_faculty', inverseRelationship: 'member_of_faculty' },
    { id: 'e-math-hf-carol', source: 'dept-math', target: 'prof-carol', relationship: 'has_faculty', inverseRelationship: 'member_of_faculty' },
    { id: 'e-math-hf-dave', source: 'dept-math', target: 'prof-dave', relationship: 'has_faculty', inverseRelationship: 'member_of_faculty' },
    { id: 'e-phys-hf-eve', source: 'dept-phys', target: 'prof-eve', relationship: 'has_faculty', inverseRelationship: 'member_of_faculty' },
    { id: 'e-phys-hf-frank', source: 'dept-phys', target: 'prof-frank', relationship: 'has_faculty', inverseRelationship: 'member_of_faculty' },

    // Professor → Course (teaches)
    { id: 'e-alice-t-algo', source: 'prof-alice', target: 'course-algo', relationship: 'teaches', inverseRelationship: 'taught_by' },
    { id: 'e-alice-t-ml', source: 'prof-alice', target: 'course-ml', relationship: 'teaches', inverseRelationship: 'taught_by' },
    { id: 'e-bob-t-db', source: 'prof-bob', target: 'course-db', relationship: 'teaches', inverseRelationship: 'taught_by' },
    { id: 'e-carol-t-calculus', source: 'prof-carol', target: 'course-calculus', relationship: 'teaches', inverseRelationship: 'taught_by' },
    { id: 'e-carol-t-linalg', source: 'prof-carol', target: 'course-linalg', relationship: 'teaches', inverseRelationship: 'taught_by' },
    { id: 'e-dave-t-stats', source: 'prof-dave', target: 'course-stats', relationship: 'teaches', inverseRelationship: 'taught_by' },
    { id: 'e-eve-t-quantum', source: 'prof-eve', target: 'course-quantum', relationship: 'teaches', inverseRelationship: 'taught_by' },
    { id: 'e-frank-t-thermo', source: 'prof-frank', target: 'course-thermo', relationship: 'teaches', inverseRelationship: 'taught_by' },

    // Student → Course (enrolled_in)
    { id: 'e-s1-ei-algo', source: 'stu-1', target: 'course-algo', relationship: 'enrolled_in', inverseRelationship: 'has_enrollment' },
    { id: 'e-s2-ei-algo', source: 'stu-2', target: 'course-algo', relationship: 'enrolled_in', inverseRelationship: 'has_enrollment' },
    { id: 'e-s3-ei-ml', source: 'stu-3', target: 'course-ml', relationship: 'enrolled_in', inverseRelationship: 'has_enrollment' },
    { id: 'e-s4-ei-ml', source: 'stu-4', target: 'course-ml', relationship: 'enrolled_in', inverseRelationship: 'has_enrollment' },
    { id: 'e-s5-ei-db', source: 'stu-5', target: 'course-db', relationship: 'enrolled_in', inverseRelationship: 'has_enrollment' },
    { id: 'e-s6-ei-calculus', source: 'stu-6', target: 'course-calculus', relationship: 'enrolled_in', inverseRelationship: 'has_enrollment' },
    { id: 'e-s7-ei-calculus', source: 'stu-7', target: 'course-calculus', relationship: 'enrolled_in', inverseRelationship: 'has_enrollment' },
    { id: 'e-s8-ei-linalg', source: 'stu-8', target: 'course-linalg', relationship: 'enrolled_in', inverseRelationship: 'has_enrollment' },
    { id: 'e-s9-ei-stats', source: 'stu-9', target: 'course-stats', relationship: 'enrolled_in', inverseRelationship: 'has_enrollment' },
    { id: 'e-s10-ei-quantum', source: 'stu-10', target: 'course-quantum', relationship: 'enrolled_in', inverseRelationship: 'has_enrollment' },
    { id: 'e-s11-ei-quantum', source: 'stu-11', target: 'course-quantum', relationship: 'enrolled_in', inverseRelationship: 'has_enrollment' },
    { id: 'e-s12-ei-thermo', source: 'stu-12', target: 'course-thermo', relationship: 'enrolled_in', inverseRelationship: 'has_enrollment' },

    // Cross-department professor collaborations (intra-layer edges visible on Professors layer)
    { id: 'e-alice-cw-carol', source: 'prof-alice', target: 'prof-carol', relationship: 'collaborates_with', inverseRelationship: 'collaborates_with' },
    { id: 'e-dave-cw-eve', source: 'prof-dave', target: 'prof-eve', relationship: 'collaborates_with', inverseRelationship: 'collaborates_with' },
    { id: 'e-bob-cw-frank', source: 'prof-bob', target: 'prof-frank', relationship: 'collaborates_with', inverseRelationship: 'collaborates_with' },
  ],
}
