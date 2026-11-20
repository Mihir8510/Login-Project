"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [token, setToken] = useState("");
    const router = useRouter();
    const API_URL = "http://localhost:3000";

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                }),
            });
            const data = await response.json();
            console.log(data);

            if (!response.ok) {
                setErrorMessage(data.message || "Invalid email or password.");
                return;
            }
            setErrorMessage("");
            setToken(data.access_token);
            localStorage.setItem("access_token", data.access_token);
            console.log("Login successful!");
            router.push("/dashboard");
        } catch (error) {
            console.log(error);
        }
    };
    return (
        <div>
            <h1>Login</h1>

            <form onSubmit={handleSubmit}>
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
                <div style={{ textAlign:"right",marginBottom:"15px"}}>
                    <Link href="/forgot-password">
                        Forgot Password?
                    </Link>
                </div>

                <button type="submit">Login</button>
                {errorMessage && (
                    <p style={{
                        color:"red",
                        textAlign:"center",
                        marginTop:"15px",
                        fontSize:"14px"
                    }}>
                        {errorMessage}
                    </p>
                )}
            </form>
            <p style={{ textAlign: "center",marginTop:"20px"}}>
                Don&apos;t have an account?{" "}
                <Link href="/register">Register</Link>
            </p>
            {token && (
                <p>Login successful! Token saved.</p>
            )}
        </div>
    );
}
