"use client";

import { useEffect,useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage(){
    const [user, setUser] = useState<{
        userId: number;
        name: string;
        email: string;
    } | null>(null);
    const router = useRouter();
    const[isEditing,setIsEditing]=useState(false);
    const[editName,setEditName]=useState("");
    const[editEmail,setEditEmail]=useState("");
    useEffect(() => {
        const token = localStorage.getItem("access_token");
        if(!token){
            router.push("/login");
        }
        const getProfile = async () => {
            try{
                const response = await fetch("http://localhost:3000/auth/profile",{
                    method:"GET",
                    headers:{
                        Authorization: `Bearer ${token}`,
                    },
                });
                const data = await response.json();
                console.log(data);
                if (!response.ok){
                    localStorage.removeItem("access_token");
                    router.push("/login");
                    return;
                }
                setUser(data.user);
            }catch(error){
                console.log(error);
            }
        };
        getProfile();
    }, []);

    const hanleEdit = () => {
        if (user) {
            setEditName(user.name);
            setEditEmail(user.email);
            setIsEditing(true);
        }
    }

    const handleSave = async () =>{
        const token = localStorage.getItem("access_token");
        try{
            const response = await fetch("http://localhost:3000/auth/profile",{
                method:"PATCH",
                headers:{
                    "Content-Type":"application/json",
                    Authorization:`Bearer ${token}`,
                },
                body:JSON.stringify({
                    name:editName,
                    email:editEmail,
                }),
            });
            
            const data = await response.json();
            if(!response.ok){
                alert(data.message || "Profile update failed");
                return;
            }
            setUser(data.user);
            setIsEditing(false);
            alert("profile updated successfully!");
        } catch(error){
            console.log(error);
            alert("Something went wrong");
        }
    };

    const handleLogout = async () => {
        const token = localStorage.getItem("access_token");
        if (token){
            await fetch("http://localhost:3000/auth/logout",{
                method: "POST",
                headers:{
                    Authorization:`Bearer ${token}`,
                },
            });
        }
        localStorage.removeItem("access_token");
        router.push("/login");
    };
    
    return (
        <div className="dashboard-container">
            <h1>Welcome to Dashboard</h1>
            <p className="dashboard-subtitle">Manage your account details here.</p>
            
            {user && (
                <div className="profile-card">
                    <div className="profile-avatar">
                        <span>👤</span>
                    </div>
                    <h2>My Profile</h2>
                    <p className="profile-subtitle">Personal account details</p>
                    {isEditing ?(
                        <>
                            <div className="profile-info">
                                <label>FULL NAME</label>
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                />
                            </div>
                            <div className="profile-info">
                                <label>EMAIL ADDRESS</label>
                                <input
                                    type="email"
                                    value={editEmail}
                                    onChange={(e) => setEditEmail(e.target.value)}
                                />
                            </div>
                            <button 
                                onClick={handleSave}
                                style={{ marginBottom:"10px"}}
                            >   
                                Save Changes
                            </button>
                            <button onClick={() =>setIsEditing(false)}>Cancel</button>
                        </>
                    ) : (
                        <>
                            <div className="profile-info">
                                <label>FULL NAME</label>
                                <p>{user.name}</p>
                            </div>
                            <div className="profile-info">
                                <label>EMAIL ADDRESS</label>
                                <p>{user.email}</p>
                            </div>
                            <button onClick={hanleEdit}>Edit Profile</button>
                        </>
                    )}
                </div>
            )}
            <button className="logout-button" onClick={handleLogout}>
                Logout
            </button>
        </div>
    );
}