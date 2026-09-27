import { useRef, useState } from "react";
import axios from "axios";
import { Spinner } from "@heroui/react";
import { formatDistanceToNowStrict } from "date-fns";
import UserProfileModal from "../userProfile/UserProfile";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import ErrorPage from "../errorPage/ErrorPage";
import toast from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsis } from "@fortawesome/free-solid-svg-icons";
import { useProfile } from "../../hooks/useProfile";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
} from "@heroui/react";

export default function CommentSection({ postId, token }) {
  const { data: user } = useProfile(token);
  let [selectedUserId, setSelectedUserId] = useState(null);
  const commentInput = useRef(null); // commentInput is an object, commentInput.current is the input you assigned using the (ref) hook
  const queryClient = useQueryClient();

  // create comment mutation fn
  const { isPending, mutate } = useMutation({
    mutationFn: () => {
      return axios.post(
        `https://route-posts.routemisr.com/posts/${postId}/comments`,
        { content: commentInput.current.value },
        { headers: { token } },
      );
    },

    onSuccess: (data) => {
      console.log("Comment Created Successfully!", data);
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["postData", postId] });

      if (commentInput.current) {
        commentInput.current.value = "";
      }
      toast.success("Comment Created Successfully!");
    },

    onError: (error) => {
      console.log("Error!", error);
      toast.error("Error Creating Comment!!");
    },
  });

  const { mutate: deleteComment } = useMutation({
    mutationFn: (commentId) => {
      return axios.delete(
        `https://route-posts.routemisr.com/posts/${postId}/comments/${commentId}`,
        { headers: { token } },
      );
    },
    onSuccess: () => toast.success("Comment Deleted!", { duration: 800 }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["postData", postId] });
    },
  });

  function handleCommentSubmit() {
    const text = commentInput.current?.value || "";
    if (text.trim().length === 0) {
      // checks if the comment is also empty after removing all whitespaces
      return;
    }

    mutate();
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      handleCommentSubmit();
    }
  }

  async function getPostComments() {
    return axios.get(
      `https://route-posts.routemisr.com/posts/${postId}/comments?page=1&limit=10`,
      {
        headers: { token },
      },
    );
  }

  const {
    data: comments,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["comments", postId],
    queryFn: getPostComments,
    select: (res) => res.data.data.comments,
  });

  if (isError) {
    return <ErrorPage />;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <>
      {/* <div className='flex justify-center items-center'>{comments === null && <Spinner/>}</div> */}
      {comments?.length == 0 && (
        <p className="text-sm text-gray-800 dark:text-gray-200 font-semibold py-3 mx-auto">
          No Comments Yet..
        </p>
      )}

      <div className="commentInput flex items-center justify-between gap-4 my-4">
        <input
          // using commentInput.current meaning using this input
          ref={commentInput}
          onKeyDown={handleKeyDown}
          type="text"
          placeholder="Enter your comment..."
          className="w-full outline-none border-2 border-gray-400 rounded-xl px-2 py-1.5 dark:border-gray-500"
        />
        <button
          onClick={handleCommentSubmit}
          disabled={isPending}
          className={`px-2 py-1.5 rounded-xl font-medium text-white transition-all ${
            isPending
              ? "bg-blue-300 cursor-not-allowed opacity-70"
              : "bg-[#1877F2] hover:bg-blue-600 cursor-pointer"
          }`}
        >
          Comment
        </button>
      </div>

      {comments?.map((comment) => (
        <div className="comments-container flex gap-3 py-3" key={comment._id}>
          <img
            src={comment.commentCreator.photo || "/default-avatar.png"}
            alt={comment.commentCreator.name}
            className="w-9 h-9 rounded-full object-cover shrink-0 cursor-pointer dark:border-2 dark:border-gray-300"
            onClick={() => setSelectedUserId(comment.commentCreator._id)}
          />
          <div className="flex flex-col flex-1">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-3 py-2 w-full relative">
              {comment?.commentCreator?._id === user?._id ? (
                <div className="absolute right-5">
                  <Dropdown size="sm">
                    <DropdownTrigger>
                      <Button variant="bordered">
                        <FontAwesomeIcon icon={faEllipsis}/>
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu aria-label="Static Actions">
                      <DropdownItem key="edit">Edit Comment</DropdownItem>
                      <DropdownItem
                        onClick={() => deleteComment(comment?._id)}
                        key="delete"
                        className="text-danger"
                        color="danger"
                      >
                        Delete Comment
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </div>
              ) : null}
              <span className="font-semibold text-sm block text-black dark:text-gray-300">
                {comment.commentCreator.name}
              </span>
              <p className="text-sm text-gray-800 dark:text-white break-all">
                {comment.content}
              </p>
            </div>
            <div className="flex gap-3 text-xs text-gray-500 mt-1">
              <span className="dark:text-gray-200">
                {formatDistanceToNowStrict(new Date(comment.createdAt))} ago
              </span>
              <button className="font-semibold hover:underline cursor-pointer dark:text-gray-200">
                Like
              </button>
              <button className="font-semibold hover:underline cursor-pointer dark:text-gray-200">
                Reply
              </button>
              {comment.likes.length > 0 && (
                <span>{comment.likes.length} likes</span>
              )}
            </div>
          </div>
        </div>
      ))}

      <UserProfileModal
        userId={selectedUserId}
        isOpen={!!selectedUserId}
        onClose={() => setSelectedUserId(null)}
        token={token}
      />
    </>
  );
}
