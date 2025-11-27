// Teacher can have subjects, classes, etc.
export interface TeacherProfile {
  name: string;
  email: string;
  subjects?: string[];
  assignedClasses?: string[];
  schoolId: string;
  userRole: "teacher";
  image?: string;
}

// Student details (no registration, only login with regNo + schoolId)
export interface StudentProfile {
  name: string;
  regNo: string;
  className?: string;
  department?: string;
  schoolId: string;
  userRole: "student";
  image?: string;
}

// School admin manages teachers and students
export interface SchoolProfile {
  schoolName: string;
  email: string;
  address?: string;
  logo?: string;
  schoolId: string; // unique ID assigned upon registration
  teachers?: string[];
  students?: string[];
  verified?: boolean;
  userRole: "school_admin";
  createdAt?: string;
}
