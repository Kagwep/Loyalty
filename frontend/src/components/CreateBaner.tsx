import React,{ useState,FormEvent  } from 'react';
import { uploadToIPFS } from '@/Infura';
import {
  SubstrateWalletPlatform,
  allSubstrateWallets,
  isWalletInstalled,
  useInkathon,
  contractQuery,
  decodeOutput,
  useRegisteredContract,
} from "@scio-labs/use-inkathon"
import { ContractIds } from "@/deployments/loyalty_marketplace/deployments";
import toast from 'react-hot-toast';
import { contractTxWithToast } from '@/utils/contract-tx-with-toast'

type FormData = {
  title:string,
  price: number;
};

type Props = {
  closeModal: () => void;
  fetchBanners: () => void;
};

const CreateBanner = ({ closeModal,fetchBanners }: Props) => {
  const [fileURL, setFileURL] = useState<string | undefined>();
  const [isSubmissionLoading, setSubmissionLoading] = useState<boolean>(false);
  const [isSubmissionSuccessful, setSubmissionSuccessful] = useState<boolean>(false);
  const [fileSubmitted, setFileSubmitted] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    title:"",
    price: 0,
  });

  const {
    activeChain,
    connect,
    disconnect,
    activeAccount,
    accounts,
    setActiveAccount,
    api,
    isConnected,
    activeSigner 
  } = useInkathon()

 // console.log(ContractIds)

  const { contract } = useRegisteredContract(ContractIds.Marketplace)
  //onsole.log(contract)


  function generateUniqueTokenId(): number {
    const timestamp = Date.now(); // Get the current timestamp in milliseconds
    const randomPart = Math.floor(Math.random() * 1000); // Random number between 0 and 999
    const uniqueId = timestamp * 1000 + randomPart; // Combine timestamp and random number
  
    // Ensure it fits within the range of u32
    return uniqueId % Math.pow(2, 32);
  }
  const handleSubmit = async (event: FormEvent) => {

    event.preventDefault();


    const allFieldsFilled = Object.values(formData).every(value => value !== null && value !== undefined && value !== "");

    const tokenId: number = generateUniqueTokenId();
    console.log("Generated unique token_id:", tokenId);
        
    if (!allFieldsFilled) {
        toast.error('Confirm all the fields are filled and try again…', {
            style: {
                color: '#000', // White text color
                fontSize:10
            }
          })
        return;
    }

    if (!activeAccount || !contract || !activeSigner || !api) {
      toast.error('Wallet not connected. Try again…', {
          style: {
              color: '#000', // White text color
              fontSize:10
          }
        })
      return
    }


    
    try {
      let response = await contractTxWithToast(api, activeAccount.address, contract, 'create_listing', {}, [
          tokenId,parseInt(formData.price.toString()),fileURL,formData.title
      ])

      const { dryResult, result: responseResult, ...rest } = response;


      
    } catch (e) {
      console.error(e)
    } finally {
      fetchBanners()
    }

  closeModal(); // Close modal after submission

  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    const response = await uploadToIPFS(file);
    console.log(response);

    if (response) {
      setFileSubmitted(true);
    }
    setFileURL(response);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-10">
      <div className="container mx-auto px-4 h-full">
        <div className="flex content-center items-center justify-center h-full">
          <div className="w-full max-w-max">
            <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4" onSubmit={handleSubmit}>
              <div className="flex justify-between items-center">
                {isSubmissionLoading && (
                  <div className="bg-yellow-200 text-yellow-800 p-2 rounded text-2xl">Room Creation is pending...</div>
                )}
                {isSubmissionSuccessful && (
                  <div className="bg-green-200 text-green-800 p-2 rounded text-2xl">Room Creation successful!</div>
                )}
                <h1 className="text-purple-950 font-semibold mb-4 text-2xl">Create NFT token</h1>
                <button onClick={closeModal} className="text-red-500 font-bold text-3xl p-2">
                  &times;
                </button>
              </div>
              <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2 text-xl" htmlFor="title">
                  Title
                </label>
                <input
                 type="text" 
                 id='title'
                 name="title" 
                 placeholder="title" 
                 value={formData.title} 
                 onChange={handleInputChange} 
                 className="w-full px-3 py-2 border border-gray-300 rounded shadow-sm text-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-2xl" />
                <label className="block text-gray-700 text-sm font-bold mb-2 text-xl" htmlFor="price">
                  Price
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-xl text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2 text-xl" htmlFor="image">
                  Profile Image
                </label>
                <input
                  type="file"
                  id="image"
                  name="image"
                  onChange={handleFileChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-xl text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div className="flex items-center justify-between">
                <button
                  className={`bg-purple-950 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline text-xl ${
                    fileSubmitted ? '' : 'opacity-50 cursor-not-allowed'
                  }`}
                  type="button"
                  onClick={handleSubmit}
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateBanner;
