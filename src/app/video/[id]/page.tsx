import VideoJS from "@/components/MyPlayer";

const Page = ({ params }: { params: {id: string} }) => {
  const videoJsOptions = {
    autoplay: true,
    controls: true,
    responsive: true,
    fluid: true,
    sources: [
      {
        src: `https://mytestingvideostorage.s3.ap-south-1.amazonaws.com/videos/${params.id}/master.m3u8`,
        type: "application/x-mpegURL",
      },
    ],
  };

  return <VideoJS options={videoJsOptions} />;
};

export default Page;
