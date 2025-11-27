export interface IUser {
  _id: string;
  name: string; // name of school, teacher, or student
  email?: string; // not required for students
  logo?: string; // for schools
  address?: string; // for schools
  schoolId?: string; // unique ID assigned to each school
  regNo?: string; // generated for students (e.g., SCHOOLNAME/INIT/001)
  userRole: "school_admin" | "teacher" | "student";
  password?: string; // only for admin and teacher
  isVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
  teachers?: string[]; // references to teacher IDs (for school admin)
  students?: string[]; // references to student IDs (for teacher)
}
export default IUser;
