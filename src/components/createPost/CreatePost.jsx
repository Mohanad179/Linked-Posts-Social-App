import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@heroui/react";
import { useRef, useState } from "react";
import { useProfile } from "../../hooks/useProfile";
import axios from "axios";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

export default function CreatePost({ token }) {
  const { data: user } = useProfile(token);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const postBodyInput = useRef(); // body reference
  const imageInput = useRef(); // Image Reference
  const [imageURL, setImageURL] = useState(null);
  const queryClient = useQueryClient();


  async function createPost() {
    const formData = new FormData();
    if (postBodyInput.current.value) {
      formData.append("body", postBodyInput.current.value);
    }

    if (imageInput.current.files[0]) {
      formData.append("image", imageInput.current.files[0]);
    }
    return axios.post("https://route-posts.routemisr.com/posts", formData, {
      headers: { token },
    });
  }

  const { mutate, isPending } = useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      // body is response.data.data.post.body
      queryClient.invalidateQueries({ queryKey: ["posts"] });

      onOpenChange(false);
      postBodyInput.current.value = "";
      clearImage();

      toast.success("Post Created Successfully!");
    },
    onError: () => {
      toast.error("Post Not Created!!");
    },
  });

  // when the user uploads an image to the post, without even posting yet, preview this image
  function handleImagePreview() {
    const imageFile = imageInput.current.files[0]; // get the image file from it's reference

    const imagePath = URL.createObjectURL(imageFile);

    setImageURL(imagePath);
  }

  function clearImage() {
    setImageURL(null);
    imageInput.current.value = ""; // clear the value from the reference
  }

  return (
    <>
      <div className="flex gap-3 items-center mt-3 max-w-2xl mx-auto px-4">
        <img
          className="w-12 h-12 rounded-full border-2 border-gray-400 dark:border-gray-500"
          src={user?.photo}
          alt="Profile Photo"
        />
        <Button
          className="justify-start py-6 w-full text-base"
          onPress={onOpen}
        >
          {`What's On Your Mind ${user?.name?.split(" ")[0]}?`}
        </Button>
      </div>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Create Post
              </ModalHeader>
              <ModalBody>
                <textarea
                  ref={postBodyInput}
                  autoFocus
                  placeholder="What's on your mind?"
                  className="resize-none p-2 border-2 border-gray-500 rounded-xl"
                  rows={5}
                ></textarea>

                <input
                  ref={imageInput}
                  onChange={handleImagePreview}
                  type="file"
                  id="imageUpload"
                  hidden
                />

                <label
                  className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 text-center py-2 px-4 w-fit rounded-xl cursor-pointer"
                  htmlFor="imageUpload"
                >
                  Upload Image
                </label>

                {imageURL && (
                  <div className="relative">
                    <button
                      onClick={clearImage}
                      className="absolute top-3 right-3 text-2xl bg-red-700 w-8 h-8 flex justify-center items-center rounded-full cursor-pointer"
                    >
                      X
                    </button>
                    <img src={imageURL} alt="" />
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button
                  className={`font-bold w-full text-lg px-2 py-1.5 rounded-xl text-white transition-all ${
                    isPending
                      ? "bg-blue-300 cursor-not-allowed opacity-70"
                      : "bg-[#1877F2] hover:bg-blue-600 cursor-pointer"
                  }`}
                  color="primary"
                  disabled={isPending}
                  onPress={mutate}
                >
                  Post
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
