/* eslint-disable no-unused-vars */
import React, { useContext, useState } from "react";
import { authContext } from "../authContext/AuthContext";
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Spinner, toggle } from "@heroui/react";
import ErrorPage from "./../errorPage/ErrorPage";
import { useProfile } from "../../hooks/useProfile";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faGear } from "@fortawesome/free-solid-svg-icons";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";
import toast from "react-hot-toast";
import { Helmet } from "react-helmet-async";
import UserProfileModal from "../userProfile/UserProfile";

// Single row for a following/followers list — same visual language as the
// user-info block in the feed's PostCard (avatar + name + @username).
function UserListRow({ u, onSelectUser }) {
  return (
    <div className="flex items-center gap-3">
      <div className="avatar w-12 h-12 flex items-center justify-center rounded-full border-2 border-gray-300 overflow-hidden shrink-0">
        <img
          src={u.photo}
          alt="avatar"
          className="w-full h-full object-cover cursor-pointer"
          onClick={() => onSelectUser(u._id)}
        />
      </div>
      <div className="name">
        <h3 className="text-black dark:text-white font-semibold">{u.name}</h3>
        <p className="text-gray-500 dark:text-gray-400 hover:underline cursor-pointer" onClick={() => onSelectUser(u._id)} >@{u.username}</p>
      </div>
    </div>
  );
}

// Fetches full user objects for a list of ids by hitting the single-user
// endpoint once per id (there's no batch endpoint). Fine at "following list"
// scale; would need a real batch endpoint if this ever needs to handle
// hundreds of ids.
function useUserList(ids, token, enabled) {
  return useQuery({
    queryKey: ["userList", ids],
    queryFn: async () => {
      const results = await Promise.all(
        ids.map((id) =>
          axios.get(`https://route-posts.routemisr.com/users/${id}/profile`, {
            headers: { token },
          })
        )
      );
      // Response envelope assumed as data.data.user, matching this app's
      // other endpoints — falls back gracefully if that assumption is off.
      return results.map(
        (res) => res.data?.data?.user ?? res.data?.data ?? res.data?.user
      );
    },
    enabled: enabled && ids?.length > 0,
  });
}

export default function Profile() {
  const { token } = useContext(authContext);
  const { data: user, isLoading, isError } = useProfile(token);
  const queryClient = useQueryClient();

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isPhotoPreviewOpen, setIsPhotoPreviewOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState(null);

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isFollowingListOpen, setIsFollowingListOpen] = useState(false)
  const [isFollowersListOpen, setIsFollowersListOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState(null)

  const followingIds = user?.following ?? [];
  const followersIds = user?.followers ?? [];


  const { data: followingUsers, isLoading: isFollowingLoading } = useUserList(
    followingIds,
    token,
    isFollowingListOpen
  );
  const { data: followersUsers, isLoading: isFollowersLoading } = useUserList(
    followersIds,
    token,
    isFollowersListOpen
  );

  // following mutation fn 
  const isFollowed = user?.following?.includes(selectedUserId);

  const { mutate: toggleFollow , isPending: isFollowPending } = useMutation({
    mutationFn: () => {
      return axios.put(`https://route-posts.routemisr.com/users/${selectedUserId}/follow`, {} , {headers: {token}} );
    },

    onSuccess: () => {
      toast.success("Follow Status Updated!", {duration: 800})
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["userList"] });
    }
  })

  const { mutate: changePhoto, isPending: isPhotoPending } = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append("photo", photoFile);
      return axios.put(
        "https://route-posts.routemisr.com/users/upload-photo",
        formData,
        {
          headers: { token },
        },
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setPhotoFile(null);
      setPhotoPreviewUrl(null);
      toast.success("Profile Photo Changed", { duration: 1000 });
    },
    onError: (err) => console.log(err),
  });

  const { mutate: changePassword, isPending: isPasswordPending } = useMutation({
    mutationFn: async () => {
      return axios.patch(
        "https://route-posts.routemisr.com/users/change-password",
        { password: currentPassword, newPassword },
        { headers: { token } },
      );
    },
    onSuccess: () => {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password Changed", { duration: 1000 });
    },
    onError: (err) => {
      console.log(err);
      toast.error(err?.response?.data?.message || "Failed to change password");
    },
  });

  const isPending = isPhotoPending || isPasswordPending;

  if (isLoading) {
    return (
      <div className="flex h-screen justify-center items-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return <ErrorPage />;
  }

  function handlePhotoSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreviewUrl(URL.createObjectURL(file));
  }

  async function handleSave(onClose) {
    if (newPassword && newPassword !== confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }
    if (newPassword && !currentPassword) {
      toast.error("Enter your current password");
      return;
    }

    try {
      if (photoFile) await changePhoto();
      if (newPassword) await changePassword();
      onClose();
    } catch (err) {
      // errors already handled in each mutation's onError; keep modal open
    }
  }

  console.log(user)

  return (
    <>
      <Helmet>
        <title>Profile</title>
      </Helmet>

      <div className="profile-container relative max-w-xl mx-auto my-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700/50 p-6 sm:p-8">
        <div onClick={() => setIsEditProfileOpen(true)}>
          <FontAwesomeIcon
            className="absolute top-5 right-5 hover:scale-110 cursor-pointer "
            icon={faGear}
            size="lg"
          />
        </div>

        <div className="profile-photo flex justify-center gap-3 pt-2 pb-2">
          <img
            onClick={() => setIsPhotoPreviewOpen(true)}
            className="w-28 h-28 rounded-full object-cover cursor-pointer border-4 border-gray-200 dark:border-gray-600 bg-transparent"
            src={user?.photo}
            alt="Profile Picture"
          />
        </div>

        <div className="profile-info flex flex-col items-center gap-3 py-3">
          <p className="name text-2xl font-bold text-black dark:text-gray-200">
            {user?.name}
          </p>

          <div className="flex items-center justify-center gap-6 my-1 py-2 px-6 rounded-lg bg-gray-200 dark:bg-gray-700/50">
            <div className="text-center">
              <span className="block font-bold text-lg text-gray-900 dark:text-white">
                {user?.following?.length || user?.followingCount || 0}
              </span>
              <span
                onClick={() => { setIsFollowingListOpen(true) }} 
                className="text-sm font-medium text-gray-500 dark:text-gray-400 cursor-pointer hover:underline">
                Following
              </span>
            </div>
            <div className="h-8 w-px bg-gray-200 dark:bg-gray-600" />
            <div className="text-center">
              <span className="block font-bold text-lg text-gray-900 dark:text-white">
                {user?.followers?.length || user?.followersCount || 0}
              </span>
              <span
                onClick={() => { setIsFollowersListOpen(true) }}
                className="text-sm font-medium text-gray-500 dark:text-gray-400 cursor-pointer hover:underline">
                Followers
              </span>
            </div>
          </div>

          <div className="w-full space-y-4 rounded-xl p-2 sm:p-4 bg-transparent text-base sm:text-lg mt-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4 border-b border-gray-200 dark:border-gray-700 pb-2">
              <span className="text-gray-500 dark:text-gray-400 font-medium">
                Username
              </span>
              <p className="font-semibold text-gray-900 dark:text-white truncate">
                @{user?.username}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4 border-b border-gray-200 dark:border-gray-700 pb-2">
              <span className="text-gray-500 dark:text-gray-400 font-medium shrink-0">
                Email
              </span>
              <p
                className="font-semibold text-gray-900 dark:text-white break-all sm:break-normal truncate"
                title={user?.email}
              >
                {user?.email}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4 border-b border-gray-200 dark:border-gray-700 pb-2">
              <span className="text-gray-500 dark:text-gray-400 font-medium">
                Gender
              </span>
              <p className="font-semibold text-gray-900 dark:text-white capitalize">
                {user?.gender}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4 border-b border-gray-200 dark:border-gray-700 pb-2">
              <span className="text-gray-500 dark:text-gray-400 font-medium">
                Date of Birth
              </span>
              <p className="font-semibold text-gray-900 dark:text-white capitalize">
                {new Date(user?.dateOfBirth).toLocaleDateString()}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4">
              <span className="text-gray-500 dark:text-gray-400 font-medium">
                Joined At
              </span>
              <p className="font-semibold text-gray-900 dark:text-white capitalize">
                {new Date(user?.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* edit profile modal */}
      <Modal
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        isOpen={isEditProfileOpen}
        onOpenChange={setIsEditProfileOpen}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Edit Profile
              </ModalHeader>
              <ModalBody>
                <div className="flex justify-center pb-2">
                  <div className="relative group cursor-pointer">
                    <img
                      className="w-24 h-24 rounded-full object-cover border-4 border-gray-200 dark:border-gray-600"
                      src={photoPreviewUrl || user?.photo}
                      alt="Profile Picture"
                    />
                    <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 rounded-full text-white text-sm font-medium cursor-pointer transition-opacity">
                      Change
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePhotoSelect}
                      />
                    </label>
                  </div>
                </div>

                <div className="w-full space-y-4 pt-2">
                  <div className="flex flex-col gap-1 border-b border-gray-200 dark:border-gray-700 pb-3">
                    <span className="text-gray-500 dark:text-gray-400 font-medium text-sm">
                      Current Password
                    </span>
                    <div className="relative mb-3">
                      <input
                        type={showCurrent ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter Your Current Password"
                        className="w-full font-semibold text-gray-900 dark:text-white bg-transparent border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <FontAwesomeIcon
                        icon={showCurrent ? faEyeSlash : faEye}
                        onClick={() => setShowCurrent((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      />
                    </div>

                    <span className="text-gray-500 dark:text-gray-400 font-medium text-sm">
                      New Password
                    </span>
                    <div className="relative mb-3">
                      <input
                        type={showNew ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter Your New Password"
                        className="w-full font-semibold text-gray-900 dark:text-white bg-transparent border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <FontAwesomeIcon
                        icon={showNew ? faEyeSlash : faEye}
                        onClick={() => setShowNew((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      />
                    </div>

                    <span className="text-gray-500 dark:text-gray-400 font-medium text-sm">
                      Confirm New Password
                    </span>
                    <div className="relative">
                      <input
                        type={showConfirm ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm New Password"
                        className="w-full font-semibold text-gray-900 dark:text-white bg-transparent border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <FontAwesomeIcon
                        icon={showConfirm ? faEyeSlash : faEye}
                        onClick={() => setShowConfirm((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      />
                    </div>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button
                  color="danger"
                  variant="light"
                  onPress={() => {
                    setPhotoFile(null);
                    setPhotoPreviewUrl(null);
                    onClose();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  color="primary"
                  isDisabled={isPending}
                  onPress={() => handleSave(onClose)}
                >
                  {isPending ? "Saving..." : "Save"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>



      {/* preview photo modal */}
      <Modal isOpen={isPhotoPreviewOpen} onOpenChange={setIsPhotoPreviewOpen}>
        <ModalContent>
          <ModalBody>
            <div className="flex justify-center items-center py-16">
              <img
                className="w-72 h-72 border-4 border-gray-200 dark:border-gray-600 bg-transparent max-w-full max-h-[80vh] rounded-full object-contain"
                src={user?.photo}
                alt="Profile Photo"
              />
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>


      {/* following list modal */}
      <Modal isOpen={isFollowingListOpen} onOpenChange={setIsFollowingListOpen}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Following</ModalHeader>
              <ModalBody>
                <div className="flex flex-col gap-4 max-h-96 overflow-y-auto pb-2">
                  {isFollowingLoading ? (
                    <div className="flex justify-center py-6">
                      <Spinner size="sm" />
                    </div>
                  ) : followingUsers?.length ? (
                    followingUsers.map((u) => (
                      <UserListRow
                        key={u._id}
                        u={u}
                        onSelectUser={setSelectedUserId}
                      />
                    ))
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">
                      Not following anyone yet.
                    </p>
                  )}
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>


      {/* followers list modal */}
      <Modal isOpen={isFollowersListOpen} onOpenChange={setIsFollowersListOpen}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Followers</ModalHeader>
              <ModalBody>
                <div className="flex flex-col gap-4 max-h-96 overflow-y-auto pb-2">
                  {isFollowersLoading ? (
                    <div className="flex justify-center py-6">
                      <Spinner size="sm" />
                    </div>
                  ) : followersUsers?.length ? (
                    followersUsers.map((u) => (
                      <UserListRow
                        key={u._id}
                        u={u}
                        onSelectUser={setSelectedUserId}
                      />
                    ))
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">
                      No followers yet.
                    </p>
                  )}
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <UserProfileModal
        userId={selectedUserId}
        isOpen={!!selectedUserId}
        onClose={() => setSelectedUserId(null)}
        token={token}
        isFollowed={isFollowed}
        toggleFollow={toggleFollow}
      />
    </>
  );
}