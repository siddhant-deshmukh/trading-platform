"use client"

import { useAuth } from "@/context/AuthContext";
import { FaSpinner } from "react-icons/fa";

function LoadingSpinner({ size = 10 }: { size: number }) {
  const {authLoading} = useAuth()

  if(authLoading) {
    return <div>
      <FaSpinner className={`animate-spin text-primary`} size={size} />
    </div>
  }
  return (
    <div></div>
  )
}

export default LoadingSpinner
