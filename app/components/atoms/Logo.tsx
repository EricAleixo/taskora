import Image from "next/image";

export const Logo = () => {
  return (
    <div className="flex items-center">
        <Image
          src={"/logo.png"}
          alt="Logo do taskora"
          width={100}
          height={100}
        ></Image>
        <h2 className="text-7xl text-gray-800">Task<span className="text-primary">ora</span></h2>
    </div>
  );
};
