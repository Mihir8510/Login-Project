"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage(){
    const [email,setEmail] = useState("");
    const router = useRouter();
    const handleSendOtp = async(e:React.FormEvent) => {
        e.preventDefault();
        const response = await fetch("http://localhost:3000/auth/forgot-password",{
            method:"POST",
            headers:{
                "Content-Type":"application/json",
            },
            body:JSON.stringify({
                email,
            }),
        });
        const data = await response.json();
        console.log(data);
        if (!response.ok){
            alert(data.message || "Failed to semnd OTP");
            return;
        }
        alert ("OTP sent successfully!")
        router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
    };
    return (
        <div>
            <h1>Forgot Password</h1>
            <form onSubmit={handleSendOtp}>
                <div>
                    <label>Email</label>
                    <input
                        type="email"
                        placeholder="Enter your registered email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <button type="submit">
                    Send OTP
                </button>
            </form>
        </div>
    )
}