"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
export default function RegisterPage(){
    const [name,setName] = useState("");
    const [email,setEmail] = useState("");
    const [password,setPassword] = useState("");
    const router = useRouter();
    const handleRegister = async (e:React.FormEvent) =>{
        e.preventDefault();
        const response = await fetch("http://localhost:3000/auth/register",{
            method:"POST",
            headers:{
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name,
                email,
                password,
            }),
        });
        const data = await response.json();
        console.log(data);
        if(!response.ok){
            alert(data.message || "Registration failed");
            return;
        }
        alert("Registration successful!");
        router.push("/login");
    };
    return (
        <div>
            <h1>Register</h1>
            <form onSubmit={handleRegister}>
                <div>
                    <label>Name</label>
                    <input
                        type="text"
                        placeholder="Enter your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>
                <div>
                    <label>Email</label>
                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div>
                    <label>Password</label>
                    <input
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <button type = "submit">
                    Register
                </button>
            </form>
            <p style={{ textAlign:"center",marginTop:"20px"}}>
                Already have an account?{" "}
                <Link href="/login">Login</Link>
            </p>
        </div>
    );
}