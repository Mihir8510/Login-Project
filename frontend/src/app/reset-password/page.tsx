"use client";
import { useState,Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function ResetPasswordForm(){
    const router = useRouter();
    const searchParams = useSearchParams();

    const email = searchParams.get("email") || "";
    const otp = searchParams.get("otp") || "";

    const[newPassword, setNewPassword] = useState("");

    const handleResetPassword = async(e:React.FormEvent) =>{
        e.preventDefault();
        try{
            const response = await fetch(
                "http://localhost:3000/auth/reset-password",
                {
                    method:"POST",
                    headers:{
                        "Content-Type":"application/json",
                    },
                    body:JSON.stringify({
                        email,
                        otp,
                        newPassword,
                    }),
                }
            );
            const data = await response.json();
            if(!response.ok){
                alert(data.message || "Password reset failed");
                return;
            }
            alert("Password reset successfully!");
            router.push("/login");
        }catch (error){
            alert("Something went wrong");
        } 
    };
    return(
        <div>
            <h1>Reset Password</h1>
            <form onSubmit={handleResetPassword}>
                <div>
                    <label>New Password:</label>
                    <input
                        type="pssword"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        minLength={8}
                        required
                    />
                </div>
                <button type ="submit">Reset Password</button>
            </form>
        </div>
    );
}
export default function ResetPasswordPage(){
    return(
        <Suspense fallback={<div>Loading...</div>}>
            <ResetPasswordForm/>
        </Suspense>
    );
}
