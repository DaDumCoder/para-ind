// pages/index.js
import { useState } from 'react'
import Para, { Environment } from '@getpara/web-sdk'
import { ParaEthersSigner }   from '@getpara/ethers-v6-integration'
import { ethers }             from 'ethers'

export default function Home() {
  const [signer, setSigner] = useState(null)

  // ← These will come from Vercel env vars in a bit
  const API_KEY       = process.env.NEXT_PUBLIC_PARA_KEY
  const RPC_URL       = process.env.NEXT_PUBLIC_RPC_URL
  const CONTRACT_ADDR = process.env.NEXT_PUBLIC_CONTRACT_ADDR
  const CONTRACT_ABI  = ['function claim() returns (bool)']

const connect = async () => {
    const para = new Para(Environment.PROD, API_KEY)
    // 1) initialize
    await para.init()

    // 2) if not logged in yet, do email + OTP
    if (!(await para.isFullyLoggedIn())) {
      // ask for email
      const email = prompt(
        'Enter your email (e.g. dev@test.getpara.com for beta):'
      )
      if (!email) return alert('Email is required to log in.')

      // tell Para your email and create the user
      para.setEmail(email)
      await para.createUser(email)

      // now ask for the OTP code they received
      const code = prompt(
        'Enter the verification code that was sent to your email:'
      )
      if (!code) return alert('OTP code is required.')

      // verify the code
      await para.verifyEmail(code)
    }

    // 3) wrap your RPC provider
    const provider = new ethers.JsonRpcProvider(RPC_URL)
    setSigner(new ParaEthersSigner(para, provider))
  }

  const claim = async () => {
    if (!signer) return
    const contract = new ethers.Contract(CONTRACT_ADDR, CONTRACT_ABI, signer)
    await (await contract.claim()).wait()
    alert('✅ Token claimed!')
  }

  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
      <h1>Para Claim Demo</h1>
      <button onClick={connect}>Connect Para Wallet</button>
      <button onClick={claim} disabled={!signer} style={{ marginLeft: 8 }}>
        Claim Token
      </button>
    </div>
  )
}
