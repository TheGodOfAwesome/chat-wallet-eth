import { useRouter } from 'next/router';
import styles from "../styles/Home.module.css";
import { useCallback, useEffect, useState } from "react";
import { ethers } from "ethers";
import { ChainId } from "@biconomy/core-types";
import SocialLogin from "@biconomy/web3-auth";
import SmartAccount from "@biconomy/smart-account";
import { IBalances } from '@biconomy/node-client';

const tokens = [
    {
        address: '0x0000000000000000000000000000000000001010',
        decimals: 18,
        symbol: 'MATIC',
    },
    {
        address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
        decimals: 6,
        symbol: 'USDC'
    },
    {
        address: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
        decimals: 6,
        symbol: 'USDT'
    },
    {
        address: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
        decimals: 18,
        symbol: 'DAI'
    },
    {
        address: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
        decimals: 18,
        symbol: 'WETH'
    },
    {
        // address: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
        decimals: 18,
        symbol: 'ETH'
    },
    {
        address: '0x4200000000000000000000000000000000000042',
        decimals: 18,
        symbol: 'OP'
    },
    {
        address: '0x6810e776880c02933d47db1b9fc05908e5386b96',
        decimals: 18,
        symbol: 'GNO'
    }
]

const Profile = () => {
    // Get the query parameter from the URL
    let router = useRouter();
    let keyword = router.query["id"];

    const [provider, setProvider] = useState<any>();
    const [account, setAccount] = useState<string>();
    const [smartAccount, setSmartAccount] = useState<SmartAccount | null>(null);
    const [scwAddress, setScwAddress] = useState("");
    const [scwLoading, setScwLoading] = useState(false);
    const [socialLoginSDK, setSocialLoginSDK] = useState<SocialLogin | null>(
        null
    );
    const [interval, enableInterval] = useState<boolean>(false)
    const [loading, setLoading] = useState<boolean>(false)

    // Forwarder config
    const [amount, setAmount] = useState<string>('')
    const [balances, setBalances] = useState<IBalances[]>([])
    const [gasToken, setGasToken] = useState<IBalances | null>()
    const [recipientAddress, setRecipientAddress] = useState<string>('')
    const [selectedToken, setSelectedToken] = useState(tokens[0])
    const [messages, setMessages] = useState('');
    const [inputValue, setInputValue] = useState('');
    // chainId: ChainId.POLYGON_MAINNET, ChainId.POLYGON_MUMBAI, ChainId.GOERLI
    const [chain, setChain] = useState(ChainId.POLYGON_MAINNET);

    const connectWeb3 = useCallback(async () => {
        if (typeof window === "undefined") return;
        console.log("Start: socialLoginSDK");
        console.log("socialLoginSDK", socialLoginSDK);
        if (socialLoginSDK?.provider) {
            const web3Provider = new ethers.providers.Web3Provider(
                socialLoginSDK.provider
            );
            setProvider(web3Provider);
            const accounts = await web3Provider.listAccounts();
            setAccount(accounts[0]);
            return;
        }
        if (socialLoginSDK) {
            socialLoginSDK.showWallet();
            return socialLoginSDK;
        }
        const sdk = new SocialLogin();
        const signature1 = await sdk.whitelistUrl('https://chat-wallet.vercel.app/');
        const signature2 = await sdk.whitelistUrl('https://chat-wallet.vercel.app/profile');
        const signature3 = await sdk.whitelistUrl('https://chat-wallet.vercel.app/send');
        const signature4 = await sdk.whitelistUrl('https://chat-wallet.vercel.app/mint');
        await sdk.init({
            chainId: ethers.utils.hexValue(chain),
            // clientId: "BM1-f8IA72Mqp5cT2yNa0RE2X3FYHRl5R0NNixUccEWGSoU_YgLap5awE2faN3pIij713FvDI4YXvLuTd54iOy0",
            whitelistUrls: {
              'https://chat-wallet.vercel.app/': signature1,
              'https://chat-wallet.vercel.app/profile': signature2,
              'https://chat-wallet.vercel.app/send': signature3,
              'https://chat-wallet.vercel.app/mint': signature4,
            },
        });
        setSocialLoginSDK(sdk);
        sdk.showWallet();
        return socialLoginSDK;
    }, [socialLoginSDK]);

    //
    // const handleBiconomy = useCallback(async () => {
    //     try {
    //     // if (!window.biconomySocialLogin) {
    //         const appUrl = getNextAppURL();
    //         const signature1 = await sdk.whitelistUrl(appUrl);
    //         const whitelistUrls: { [P in string]: string } = {};
    //         whitelistUrls[appUrl] = signature1;
    //         await sdk.init({
    //         chainId: ethers.utils.hexValue(Mumbai),
    //         whitelistUrls,
    //         whteLableData: {
    //             logo: 'https://user-images.githubusercontent.com/11297176/195363494-6cc53b41-958d-4493-88b3-2cbfc65a2594.png',
    //             name: 'Web3 Monorepo',
    //         },
    //         });
    //         // store the sdk on the window object
    //         window.biconomySocialLogin = sdk;
    //         console.log('initial setup of sdk', window.biconomySocialLogin);
    //     // }
    //     if (!window.biconomySmartAccount && window.biconomySocialLogin.provider) {
    //         await setupBiconomy(Mumbai as ChainId);
    //         console.log('smartAccount', window.biconomySmartAccount);
    //     }
    //     } catch (error) {
    //     console.error(error);
    //     }
    // }, [sdk, setupBiconomy]);

    async function getBalance(smartAccount: SmartAccount) {
        if (!smartAccount) return
        console.log('smartAccount: ', smartAccount)
        /* this function fetches the balance of the connected smart wallet */
        const balanceParams =  {
            // chainId: ChainId.POLYGON_MAINNET, ChainId.POLYGON_MUMBAI, ChainId.GOERLI
            chainId: chain,
            eoaAddress: smartAccount.address,
            tokenAddresses: [],
        }
        console.log('smartAccount: ', smartAccount)
        /* use getAlltokenBalances and getTotalBalanceInUsd query the smartAccount */
        const balFromSdk = await smartAccount.getAlltokenBalances(balanceParams)
        // alert(JSON.stringify(balFromSdk));
        console.log('balFromSdk::: ', balFromSdk)
        const usdBalFromSdk = await smartAccount.getTotalBalanceInUsd(balanceParams)
        console.log('usdBalFromSdk: ', usdBalFromSdk)
        setBalances(balFromSdk.data)
        setGasToken(balFromSdk.data[0])
    }

    // if wallet already connected close widget
    useEffect(() => {
        console.log("hidelwallet");
        if (socialLoginSDK && socialLoginSDK.provider) {
            socialLoginSDK.hideWallet();
        }
    }, [account, socialLoginSDK]);

    // after metamask login -> get provider event
    useEffect(() => {
        const interval = setInterval(async () => {
            if (account) {
                clearInterval(interval);
            }
            if (socialLoginSDK?.provider && !account) {
                connectWeb3();
            }
        }, 1000);

        return () => {
            clearInterval(interval);
        };
    }, [account, connectWeb3, socialLoginSDK]);

    const disconnectWeb3 = async () => {
        if (!socialLoginSDK || !socialLoginSDK.web3auth) {
            console.error("Web3Modal not initialized.");
            return;
        }
        await socialLoginSDK.logout();
        socialLoginSDK.hideWallet();
        setProvider(undefined);
        setAccount(undefined);
        setScwAddress("");
    };

    useEffect(() => {
        async function setupSmartAccount() {
        setScwAddress("");
        setScwLoading(true);
        const smartAccount = new SmartAccount(provider, {
            activeNetworkId: chain,
            supportedNetworksIds: [chain],
        });
        await smartAccount.init();
        await getBalance(smartAccount);
        const context = smartAccount.getSmartAccountContext();
        setScwAddress(context.baseWallet.getAddress());
        setSmartAccount(smartAccount);
        setScwLoading(false);
        }
        if (!!provider && !!account) {
        setupSmartAccount();
        console.log("Provider...", provider);
        }
    }, [account, provider]);

    return (
        <div className={styles.container}>
        <main className={styles.main}>
            <h1>Access Wallet</h1>
            <button onClick={!account ? connectWeb3 : disconnectWeb3}>
                {!account ? "Connect Wallet" : "Disconnect Wallet"}
            </button>

            {
                scwLoading 
                    && 
                <h2>Loading Smart Account...</h2>
            }

            {
                scwAddress 
                    && 
                (
                    <div>
                        <h2>Smart Account Address</h2>
                        <p>{scwAddress}</p>
                        <h2>Balance</h2>
                        {
                            balances.map((balance, index) => {
                                return (
                                    <div key={index} >
                                        <p>{balance.contract_name} - {balance.contract_ticker_symbol} - {ethers.utils.formatUnits(balance.balance, balance.contract_decimals)}</p>
                                    </div>
                                )
                            })
                        }
                        <h2>Query</h2>
                        <p>{keyword}</p>
                    </div>
                )
            }

        </main>
        </div>
    );
};

export default Profile;