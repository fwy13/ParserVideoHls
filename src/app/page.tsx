"use client";
import { XOR } from "@/utils/XOR";
import { indexOfBytes } from "@/utils/indexOfByte";
import isValidM3u8 from "@/utils/isValidM3u8";
import { toArrayBuffer } from "@/utils/toArrayBuffer";
import { useRef, useState } from "react";


const Home = () => {
  const useFile = useRef<HTMLInputElement | null>(null);
  const [isListFile, setListFile] = useState<{ name: string, offsetImage: number, image: string, blob: Blob }[] | null>(null);
  const useM3u8 = useRef<HTMLTextAreaElement | null>(null);
  const [isError, setError] = useState<boolean>(false);
  const [isSuccess, setSuccess] = useState<boolean>(false);
  const [isProcessing, setProcessing] = useState<boolean>(false);
  const [isLoadedFile, setLoadedFile] = useState<number>(0);
  const handleFile = async () => {
    const listFile: { name: string, offsetImage: number, image: string, blob: Blob }[] = [];
    const IEND = Uint8Array.from([0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82]);
    const responseImage = await fetch("/flag.png");
    const bufferImage = await responseImage.arrayBuffer();
    const len = useFile.current!.files!.length
    for (let i = 0; i < len; i++) {
      const buffer = await useFile.current!.files![i].arrayBuffer();
      const resultBuffer = XOR(buffer);
      const image = Buffer.concat([new Uint8Array(bufferImage), new Uint8Array(resultBuffer)]);
      const blobImage = new Blob([image], {
        type: "image/png"
      });

      listFile.push({
        name: useFile.current!.files![i].name,
        offsetImage: indexOfBytes(toArrayBuffer(image), IEND),
        image: URL.createObjectURL(blobImage),
        blob: blobImage
      })
    }
    return listFile;
  }

  const handlerUpload = async () => {
    await handleFile().then(async (listFile) => {
      setListFile(listFile);
      setProcessing(true);
      let loadedFile = 0;
      for (const item of listFile) {
        const formData = new FormData();
        formData.append("name", item.name);
        formData.append("file", item.blob);
        const response = await fetch("/api/tiktok", {
          method: "POST",
          body: formData
        }).then(res => res.json());
        loadedFile++;
        setLoadedFile(loadedFile);
        const pattern = new RegExp(response.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        if (useM3u8.current!.value.length > 0) {
          useM3u8.current!.value = useM3u8.current!.value.replace(pattern, response.url);
        }
        useM3u8.current!.value.trim();
      }
      setSuccess(true);
      setProcessing(false);
    }
    );

  }
  return (
    <div className="flex flex-col justify-center items-center w-full h-screen gap-2">
      <div className="flex flex-col justify-center items-center relative w-[300px] h-[200px] border-2 border-dashed rounded-lg">
        {isListFile === null && <label>Thả các file ts segment ở đây.</label>}
        {isListFile && <div>
          <div className="flex flex-col w-full items-center">
            <span>Total file: {isListFile.length}</span>
            <span>Loading: {isLoadedFile}/{isListFile.length}</span>
          </div>
        </div>}
        <input type="file" className="absolute w-full h-full p-2 opacity-0" accept=".ts" multiple ref={useFile} />
      </div>
      <textarea disabled={isProcessing} ref={useM3u8} className="w-[300px] h-[200px] max-h-[200px] outline-none border-2 border-dashed rounded px-3 py-2" placeholder="Để m3u8 gốc ở đây!" />
      <div className="mt-5 flex flex-col gap-3">
        <button onClick={handlerUpload} className="p-2 rounded bg-blue-400">Process...</button>
        {isSuccess && <div className="flex flex-col gap-2 justify-center items-center">
          <button onClick={() => {
            const value = useM3u8.current!.value;
            const target = useM3u8.current!;
            target.select();
            target.setSelectionRange(0, value.length);
            navigator.clipboard.writeText(value);
          }} className="p-2 bg-red-400 rounded">Copy output.</button>
          {isError ? (
            <h1 className="text-red-400">Có lỗi xảy ra!</h1>
          ) : (<h1 className="text-green-400">Thành công!</h1>)}
        </div>}
      </div>
    </div>
  )
}

export default Home;