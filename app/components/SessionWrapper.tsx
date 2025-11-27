"use client";

import { SessionProvider } from "next-auth/react";

export default function SessionWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SessionProvider>{children}</SessionProvider>;
}
// "use client";

// import { SessionProvider } from "next-auth/react";

// interface SessionWrapperProps {
//   children: React.ReactNode;
// }

// export default function SessionWrapper({ children }: SessionWrapperProps) {
//   return (
//     <SessionProvider
//       refetchInterval={5 * 60} // Refetch session every 5 minutes
//       refetchOnWindowFocus={true}
//     >
//       {children}
//     </SessionProvider>
//   );
// }
