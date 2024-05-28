import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import axios from 'axios';

export default function Account() {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axios.get('http://localhost:4444/api/users/profile', {
                    headers: {
                        Authorization: localStorage.getItem('token')
                    }
                });
                setProfile(response.data);
            } catch (error) {
                console.error('Error fetching profile:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleUpload = async (event) => {
        event.preventDefault();
        const files = event.target.files;
        if (!files || files.length === 0) {
            console.error('No file selected');
            return;
        }
        const file = files[0];
        const formData = new FormData();
        formData.append('profile', file);
        try {
            await axios.post('http://localhost:4444/api/users/profile', formData, {
                headers: {
                    Authorization: localStorage.getItem('token'),
                    'Content-Type': 'multipart/form-data'
                }
            });
            // Refresh profile after upload
            setProfile({ profile: file.name }); // Assuming the uploaded file name represents the profile
        } catch (error) {
            console.error('Error uploading profile:', error);
        }
    };

    return (
        <div>
            <h1>Account</h1>
            {user && (
                <>
                    <h4>Username: {user.username}</h4>
                    <h4>Email: {user.email}</h4>
                </>
            )}
            {loading ? (
                <p>Loading...</p>
            ) : (
                <>
                    {profile ? ( // Show profile if it exists
                        <>
                            <h4>Profile:</h4>
                            <img 
                                src={`http://localhost:4444/uploads/${profile.profile}`} 
                                alt="Profile" 
                                style={{ width: '150px', height: '150px', objectFit: 'cover' }} 
                            />
                        </>
                    ) : (
                        <div>
                            <h4>No profile found.</h4>
                            <h4>Please upload your profile:</h4>
                            <input type="file" name="profile" accept="image/*" onChange={handleUpload} />
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
