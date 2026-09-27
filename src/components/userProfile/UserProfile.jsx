import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@heroui/react"
import axios from "axios"
import { useEffect, useState } from "react"
import { useProfile } from "../../hooks/useProfile"

export default function UserProfileModal({ userId, isOpen, onClose, token, isFollowed, toggleFollow }) {

    const { data: user } = useProfile(token)

    const [profile, setProfile] = useState(null)

    useEffect(() => {
        if (!isOpen || !userId) return

        async function getUserProfile() {
            try {
                const { data } = await axios.get(`https://route-posts.routemisr.com/users/${userId}/profile`,
                    { headers: { token } }
                )
                setProfile(data.data.user) // when you access data in the ui => profile.name **NOT** profile.user.name
                // profile (state) now is user so profile?.photo = the profile pic
            } catch (error) {
                console.log(error)
            }
        }
        
        getUserProfile()
    }, [userId, isOpen, token])



    return (
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
    <ModalContent>
        <ModalHeader className="flex flex-col items-center gap-3 pt-8 pb-2">
            <img
                src={profile?.photo || '/default-avatar.png'}
                alt={profile?.name}
                className="w-28 h-28 rounded-full object-cover border-4 border-gray-100"
            />
        </ModalHeader>
        <ModalBody>
            {profile && (
                <div className="flex flex-col items-center gap-4 pb-6">
                    <div className="text-center">
                        <h2 className="font-bold text-2xl">{profile.name}</h2>
                        <p className="text-base text-gray-500">@{profile.username}</p>
                    </div>
                    <div className="flex gap-12 mt-2">
                        <div className="text-center">
                            <span className="font-bold text-2xl block">{profile.following.length}</span>
                            <span className="text-sm text-gray-500">Following</span>
                        </div>
                        <div className="text-center">
                            <span className="font-bold text-2xl block">{profile.followers.length}</span>
                            <span className="text-sm text-gray-500">Followers</span>
                        </div>
                    </div>
                    <span>
                        <span className="dark:text-gray-400">Joined Since: </span>
                        <span className="font-semibold">{new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                    </span>
                </div>
            )}
        </ModalBody>
        <ModalFooter className="justify-center pt-0 pb-6">
            { userId !== user?._id ? 
                <Button
                  onPress={() => {toggleFollow()}} 
                  color="primary" 
                  className={ !isFollowed ? "w-full max-w-xs bg-blue-500 text-white px-4 py-2 font-semibold rounded-lg hover:cursor-pointer hover:bg-blue-600" : "w-full max-w-xs bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 border-white px-4 py-2 font-semibold rounded-lg hover:cursor-pointer" }> {isFollowed ? "Unfollow" : "Follow"} </Button>
                : null}
        </ModalFooter>
    </ModalContent>
</Modal>
    )
}