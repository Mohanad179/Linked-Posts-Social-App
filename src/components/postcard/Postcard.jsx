import { formatDistanceToNowStrict } from "date-fns";
import { Image } from "@heroui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComment, faShare, faHeart } from "@fortawesome/free-solid-svg-icons";
import CommentSection from "../commentsSection/CommentsSection";
import { useEffect, useState } from "react";
import UserProfileModal from "../userProfile/UserProfile";
import { Link } from "react-router-dom";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
} from "@heroui/react";
import { useProfile } from "../../hooks/useProfile";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";


function SharedPostPreview({ sharedPost }) {
  if (!sharedPost) {
    // Original was deleted or unavailable — don't crash the outer card.
    return (
      <div className="mt-3 rounded-lg border border-gray-200 dark:border-gray-600 p-3 text-sm text-gray-500 dark:text-gray-400">
        This post is no longer available.
      </div>
    );
  }

  return (
    <Link
      to={`/postData/${sharedPost.id}`}
      className="mt-3 block rounded-lg border border-gray-200 dark:border-gray-600 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors"
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 overflow-hidden shrink-0">
          <img
            src={sharedPost.user?.photo}
            alt="avatar"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-black dark:text-white">
            {sharedPost.user?.name}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            @{sharedPost.user?.username} ·{" "}
            {formatDistanceToNowStrict(new Date(sharedPost.createdAt))} ago
          </p>
        </div>
      </div>

      {sharedPost.body && (
        <p className="text-sm text-black dark:text-white break-all mb-2">
          {sharedPost.body}
        </p>
      )}

      {sharedPost.image && (
        <div className="flex justify-center items-center">
          <img
            src={sharedPost.image}
            alt={sharedPost.body || "shared post image"}
            className="w-full h-auto object-contain rounded-md"
            style={{ maxHeight: "400px" }}
          />
        </div>
      )}

      <div className="flex gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
        <span>{sharedPost.likesCount ?? 0} likes</span>
        <span>{sharedPost.commentsCount ?? 0} comments</span>
        <span>{sharedPost.sharesCount ?? 0} shares</span>
      </div>
    </Link>
  );
}

export default function Postcard({
  post,
  token,
  defaultShowComments = false,
  onDelete,
  onEdit,
}) {
  const { data: user } = useProfile(token);
  const queryClient = useQueryClient();
  const [showComments, setshowComments] = useState(defaultShowComments);
  let [selectedUserId, setSelectedUserId] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editBody, setEditBody] = useState(post.body);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [shareCaption, setShareCaption] = useState("");

  // check if the post's likes array includes the owner's id
  const isLiked = post?.likes?.includes(user?._id);

  const [optimisticLiked, setOptimisticLiked] = useState(null)
  const displayLiked = optimisticLiked ?? isLiked

  // check if the Owner's following list includes the post user id
  const isFollowed = user?.following?.includes(post?.user?._id)

 useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOptimisticLiked(null)
 }, [isLiked])

  // like mutation fn 
 const { mutate: toggleLike, isPending } = useMutation({
    mutationFn: () => axios.put(`https://route-posts.routemisr.com/posts/${post?.id}/like`, {}, { headers: { token } }),
    onMutate: () => setOptimisticLiked(!isLiked),
    onError: () => {
        setOptimisticLiked(null)
        toast.error("Failed to update like")
    },
    onSettled: () => {
        queryClient.invalidateQueries({ queryKey: ["posts"] })
        queryClient.invalidateQueries({ queryKey: ["postData", post.id] })
    }
})

 const { mutate: toggleFollow, isPending: isFollowPending } = useMutation({
    mutationFn: () => {
        return axios.put(`https://route-posts.routemisr.com/users/${post?.user?._id}/follow`, {} , {headers: {token}})
    },
    onSuccess: () => {
      toast.success("Follow Status Updated", {duration: 800})
    },
    onSettled: () => {
        queryClient.invalidateQueries({ queryKey: ["posts"] })
        queryClient.invalidateQueries({ queryKey: ["postData", post.id] })
        queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: () => {
        toast.error("Failed to update follow status.", {duration: 1000})
    }
 })


 const { mutate: sharePost, isPending: isSharePending } = useMutation({
    mutationFn: (body) =>
      axios.post(
        `https://route-posts.routemisr.com/posts/${post?.id}/share`,
        { body },
        { headers: { "Content-Type": "application/json", token } }
      ),
    onSuccess: () => {
      toast.success("Post shared", { duration: 1000 })
      setIsShareOpen(false)
      setShareCaption("")
    },
    onError: () => {
      toast.error("Failed to share post")
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] })
      queryClient.invalidateQueries({ queryKey: ["postData", post.id] })
    }
 })


  return (
    <>
      <div className="cards-container m-3">
        <div className="post-card max-w-2xl mx-auto bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-500 rounded-xl p-4 shadow-sm">
          <div className="head flex items-center justify-between mb-3">
            <div className="user-info flex items-center gap-3">
              <div className="avatar w-12 h-12 flex items-center justify-center rounded-full border-2 border-gray-300 overflow-hidden">
                <img
                  src={post.user.photo}
                  alt="avatar"
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => setSelectedUserId(post.user._id)}
                />
              </div>

              <div className="name">
                <h3 className="text-black dark:text-white font-semibold">
                  {post.user.name}
                </h3>
                <p
                  onClick={() => setSelectedUserId(post.user._id)}
                  className="text-gray-500 dark:text-gray-400 hover:cursor-pointer hover:underline"
                >
                  @{post.user.username}
                </p>
                <Link to={`/postData/${post.id}`}>
                  <span className="text-gray-500 dark:text-gray-400 font-light hover:underline hover:cursor-pointer">
                    {formatDistanceToNowStrict(new Date(post.createdAt))} ago
                    {post.isShare && " · shared a post"}
                  </span>
                </Link>
              </div>
            </div>

            {post?.user?._id === user?._id ? (
              <Dropdown>
                <DropdownTrigger>
                  <Button variant="ghost">•••</Button>
                </DropdownTrigger>
                <DropdownMenu aria-label="Static Actions">
                  <DropdownItem key="edit" onClick={() => setIsEditOpen(true)}>
                    Edit Post
                  </DropdownItem>
                  <DropdownItem
                    key="delete"
                    className="text-danger"
                    color="danger"
                    onClick={() => onDelete(post.id)}
                  >
                    Delete Post
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            ) : null}

            {post?.user?._id !== user?._id ? (
              <button 
                className={ !isFollowed ? "bg-blue-500 text-white px-4 py-2 font-semibold rounded-lg hover:cursor-pointer hover:bg-blue-600" : "bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 border-white px-4 py-2 font-semibold rounded-lg hover:cursor-pointer" }
                disabled={isFollowPending}
                onClick={() => { toggleFollow() }}
              >
                { isFollowed ? "Unfollow" : "Follow" }
              </button>
            ) : null}
          </div>

          <div className="body text-black mb-4">
            {post.body?.trim() && (
              <p className="mb-2 break-all dark:text-white">{post.body}</p>
            )}
            {post.image && (
              <div className="body-img flex justify-center items-center">
                <Image
                  alt={post.body}
                  src={post.image}
                  classNames={{ img: "w-full h-auto object-contain" }}
                  style={{ maxHeight: "750px" }}
                />
              </div>
            )}

            {post.isShare && <SharedPostPreview sharedPost={post.sharedPost} />}
          </div>

          <div className="interactions flex justify-between items-center text-gray-600 font-semibold">
            <button
              onClick={() => toggleLike()}
              disabled={isPending}
              className="flex justify-center items-center gap-1 cursor-pointer dark:text-gray-200"
            >
              <FontAwesomeIcon
                icon={faHeart}
                className={displayLiked ? "text-red-500" : ""}
              />
              {post?.likesCount}
            </button>
            <button
              onClick={() => {
                setshowComments((prev) => !prev);
              }}
              className="flex justify-center items-center gap-1 cursor-pointer dark:text-gray-200"
            >
              <FontAwesomeIcon icon={faComment} />
              {post?.commentsCount}
            </button>
            <button
              onClick={() => setIsShareOpen(true)}
              disabled={isSharePending}
              className="flex justify-center items-center gap-1 cursor-pointer dark:text-gray-200"
            >
              <FontAwesomeIcon icon={faShare} />
              {post?.sharesCount}
            </button>
          </div>

          <div className="comments">
            {showComments && (
              <CommentSection
                postId={post.id}
                token={token}
                userId={post.user._id}
              />
            )}
          </div>
        </div>
      </div>

      <UserProfileModal
        userId={selectedUserId}
        isOpen={!!selectedUserId}
        onClose={() => setSelectedUserId(null)}
        isFollowed={isFollowed}
        toggleFollow={toggleFollow}
        token={token}
      />

      {/* edit post modal  */}
      <Modal
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        isOpen={isEditOpen}
        onOpenChange={setIsEditOpen}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Edit Post
              </ModalHeader>
              <ModalBody>
                <textarea
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                  autoFocus
                  placeholder="What's on your mind?"
                  className="resize-none p-2 border-2 border-gray-500 rounded-xl"
                  rows={5}
                ></textarea>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={() => {
                    onEdit(post.id, editBody);
                    setIsEditOpen(false);
                  }}
                >
                  Confirm
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* share post modal  */}
      <Modal
        isDismissable={!isSharePending}
        isKeyboardDismissDisabled={true}
        isOpen={isShareOpen}
        onOpenChange={setIsShareOpen}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Share Post
              </ModalHeader>
              <ModalBody>
                <textarea
                  value={shareCaption}
                  onChange={(e) => setShareCaption(e.target.value)}
                  autoFocus
                  placeholder="Add a comment (optional)"
                  className="resize-none p-2 border-2 border-gray-500 rounded-xl"
                  rows={3}
                ></textarea>
                <SharedPostPreview sharedPost={post} />
              </ModalBody>
              <ModalFooter>
                <Button
                  color="danger"
                  variant="light"
                  onPress={onClose}
                  isDisabled={isSharePending}
                >
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={() =>
                    // API rejects an empty body — send a single space as a
                    // workaround so "share with no comment" still works.
                    sharePost(shareCaption.trim() === "" ? " " : shareCaption)
                  }
                  isLoading={isSharePending}
                >
                  Share
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}