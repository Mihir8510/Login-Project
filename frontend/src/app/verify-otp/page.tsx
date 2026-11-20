"use client";

import { useState, Suspense} from "react";
import { useSearchParams, useRouter } from "next/navigation";

function VerifyOtpForm(){
    const router = useRouter();
    const searchParams = useSearchParams();
    const emailFromUrl = searchParams.get("email") || "";
    const [email, setEmail] = useState(emailFromUrl);
    const [otp, setOtp] = useState("");
    const handleVerifyOtp = async (e: React.FormEvent) =>{
        e.preventDefault();

        try{
            const response = await fetch(
                "http://localhost:3000/auth/verify-reset-otp",
                {
                    method:"POST",
                    headers:{
                        "Content-Type":"application/json",
                    },
                    body:JSON.stringify({
                        email,
                        otp,
                    }),
                }
            );
            const data = await response.json();
            if(!response.ok){
                alert(data.message || "OTP verification failed");
                return;
            }
            alert("OTP verified successfully!");
            router.push(
                `/reset-password?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`
            );
        }catch (error){
            alert("Something went wrong");
        }
    };
    return(
        <div>
            <h1>Verify OTP</h1>
            <form onSubmit={handleVerifyOtp}>
                <div>
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        required
                    />
                </div>

                <div>
                    <label>OTP:</label>
                    <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="Enter 6 digit OTP"
                        maxLength={6}
                        required
                    />
                </div>
                <button type="submit">Verify OTP</button>
            </form>
        </div>
    );
}
export default function VerifyOtpPage(){
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <VerifyOtpForm/>
        </Suspense>
    );
}