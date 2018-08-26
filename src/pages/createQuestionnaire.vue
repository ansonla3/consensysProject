<template>
  <section class="container">
    <div>
    <strong>Current Account : {{ currentAccount }}</strong>

	<b-form-input v-model="title"
		type="text"
		placeholder="Survey Title"></b-form-input>

    <b-form-group label="Questionnaire">

        <b-form-input type="text" v-model="question1"
            placeholder="Question 1."></b-form-input>
            <b-form-radio-group v-model="selected"
                :options="options"
                name="q1">
            </b-form-radio-group>


        <b-form-input type="text" v-model="question2"
            placeholder="Question 2."></b-form-input>
            <b-form-radio-group v-model="selected"
                :options="options"
                name="q2">
            </b-form-radio-group>

        <b-form-input type="text" v-model="question3"
            placeholder="Question 3."></b-form-input>
            <b-form-radio-group v-model="selected"
                :options="options"
                name="q3">
            </b-form-radio-group>

    </b-form-group>
   
	<b-form-group>
   		<b-form-input v-model="maxParticipants"
			type="text"
			placeholder="Max Participants"></b-form-input>
	</b-form-group>

	<b-form-group>
		<b-form-input v-model="rewards"
			type="number"
			placeholder="Total Rewards in ETH"></b-form-input>
	</b-form-group>

    <button @click="submit()">Submit</button>
    </div>

  </section>
</template>

<script>


import { SURVEY_CONTRACT_ABI, ENS_CONTRACT_ABI, RESOLVER_CONTRACT_ABI, REGISTRAR_CONTRACT_ABI } from '~/utils/contractABI'
import config from '~/config'
import namehash from '~/utils/ensUtils'


export default {
	data() {
		return {
            quest: [{}, {}, {}],
            question1: '',
            question2: '',
            question3: '',
            selected: 'YESNO',
            options: [
                { text: 'Yes/No', value: 'YESNO' },
                { text: 'Multiple Choice', value: 'MC', disabled: true },
                { text: 'Sentence', value: 'TEXT',  disabled: true }
            ],
            questions: [],
			questionnires: [],
			web3Instance: this.$store.state.web3Instance,
			currentAccount: '',
			rewards: '',
			maxParticipants: '',
			title: '',
			ResolverContract: '',
		}
    },
    async mounted() {
            // Checking if Web3 has been injected by the browser (Mist/MetaMask)
            if (typeof web3 !== 'undefined') {
                // Use MetaMask's provider
				this.$store.dispatch('registerWeb3', window.web3)
				const accounts = await this.web3Instance.eth.getAccounts()

				if (accounts.length === 0) {
					alert('Please unlock metamask plugin to enter this Dapp!')
				} else {
					this.currentAccount = accounts[0]
					// Set Resolver Contract
					const ResolverContract = new this.web3Instance.eth.Contract(RESOLVER_CONTRACT_ABI, config.RESOLVER_ADDRESS_RINKEBY)
					// Use ENS Resolver to get the smart contract address
					const surveyContractAddress = await ResolverContract.methods.addr(namehash(config.ENS_NAME_RINKEBY, this.web3Instance)).call()
			 		// console.log(" address :", surveyContractAddress)
					const QuestionContract = new this.web3Instance.eth.Contract(SURVEY_CONTRACT_ABI, surveyContractAddress)
					this.QuestionContract = QuestionContract
					this.ResolverContract = ResolverContract
				}
            } else {
				alert('Please install Metamask extension!')
                // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
                // window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
            }
    
    },
    
	methods: {
        async submit() {
			const currentAccount = this.$store.state.web3Instance.currentAccount

			this.questions = [
				{ title: this.title },
				{
					number: "1",
					question: this.question1,
					type: this.selected,
				},
				{
					number: "2",
					question: this.question2,
					type: this.selected,
				},
				{
					number: "3",
					question: this.question3,
					type: this.selected,
				}
			]

// this.ResolverContract.methods.setAddr(namehash("survey.test", this.web3Instance), "0xaf5027cdcf25637ea4c4777e03f517a49f60de39")
// 	.send( { from: currentAccount })
// 	.on('transactionHash', function(hash){
// 		console.log('Tx Hash:', hash)
// 	})
// 	.on('confirmation', function(confirmationNumber, receipt){
// 		console.log('Confirm number :', confirmationNumber)
// 	})
// 	.on('receipt', function(receipt){
// 		// receipt example
// 		console.log('Receipt :', receipt)
// 	})

	// 			const surveyContractAddress = await this.ResolverContract.methods.addr(namehash(config.ENS_NAME_RINKEBY, this.web3Instance)).call()
	// console.log(" address :", surveyContractAddress)

			const { hash } = await this.$axios.$post(`${config.IPFS_END_POINT}/json/store`, this.questions)

			const key = this.web3Instance.utils.sha3(currentAccount + Date.now()) 
			
			this.showAfterSubmit()
			const result = 	await this.QuestionContract.methods.createQuestionnaire(key, hash, this.maxParticipants)
				.send({ from: currentAccount, value: this.web3Instance.utils.toWei(this.rewards, 'ether') })
			this.showCreateSuccess()
			this.goToMainPage()
		},
		goToMainPage() {
			setTimeout(() => { 
				window.location.href = '/'
			}, 5000);
		}
	},
	notifications: {
		showAfterSubmit: {
			title: 'Your are creating a questionnaire',
			message: 'Please confirm the transaction & wait until you see the next notification',
			type: 'info'
		},
		showCreateSuccess: {
			title: 'Questionnaire is created successfully',
			message: 'You will be rediteced to the main page after 5 seconds',
			type: 'success'
		}
	}
}
</script>

<style>
</style>

// ENS Chcecking
const ENSContract = new this.web3Instance.eth.Contract(ENS_CONTRACT_ABI, config.ENS_ADDRESS_RINKEBY)

// Set your ENS to the address you want
// this.ResolverContract.methods.setAddr(namehash("survey.test", this.web3Instance), "0xaf5027cdcf25637ea4c4777e03f517a49f60de39")
// 	.send( { from: currentAccount })
// 	.on('transactionHash', function(hash){
// 		console.log('Tx Hash:', hash)
// 	})
// 	.on('confirmation', function(confirmationNumber, receipt){
// 		console.log('Confirm number :', confirmationNumber)
// 	})
// 	.on('receipt', function(receipt){
// 		// receipt example
// 		console.log('Receipt :', receipt)
// 	})


// Resolver info
// console.log("Resolver info : ", await ENSContract.methods.resolver(namehash("survey.test", this.web3Instance)).call())

// Get the owner's address of DOMAIN.test
// const ensHash = await ENSContract.methods.owner(this.namehash("survey.test")).call()

// Get the .test contract address
// const testDomainContractAddress = await ENSContract.methods.owner(this.namehash('test')).call()

// Set up the Registrar Contract at testDomainContractAddress
// const testRegistrar = new this.web3Instance.eth.Contract(REGISTRAR_CONTRACT_ABI, testDomainContractAddress)

// Register ENS 
// testRegistrar.methods.register(this.web3Instance.utils.sha3("survey"), currentAccount)
// 	.send( { from: currentAccount } )
// 	.on('transactionHash', function(hash){
// 		console.log('Tx Hash:', hash)
// 	})
// 	.on('confirmation', function(confirmationNumber, receipt){
// 		console.log('Confirm number :', confirmationNumber)
// 	})
// 	.on('receipt', function(receipt){
// 		// receipt example
// 		console.log('Receipt :', receipt)
// 	})

// Set ENS to a RESOLVER Contract address
// ENSContract.methods.setResolver(namehash("survey.test"), "0x5d20cf83cb385e06d2f2a892f9322cd4933eacdc")
// 	.send({ from: currentAccount })
// 	.on('transactionHash', function(hash){
// 		console.log('Tx Hash:', hash)
// 	})
// 	.on('confirmation', function(confirmationNumber, receipt){
// 		console.log('Confirm number :', confirmationNumber)
// 	})
// 	.on('receipt', function(receipt){
// 		// receipt example
// 		console.log('Receipt :', receipt)
// 	})

// Check YOUR_NAME .test already registered
const isRegistered = await testRegistrar.methods.expiryTimes(this.web3Instance.utils.sha3("survey")).call()

// this.QuestionContract.methods.createQuestionnaire(key, hash, this.maxParticipants)
// 	.send({ from: currentAccount, value: this.web3Instance.utils.toWei(this.rewards, 'ether') })
// 	.on('transactionHash', function(hash){
// 		console.log('Tx Hash:', hash)
// 	})
// 	.on('confirmation', function(confirmationNumber, receipt){
// 		console.log('Confirm number :', confirmationNumber)
// 	})
// 	.on('receipt', function(receipt){
// 		// receipt example
// 		console.log('Receipt :', receipt)
// 	})