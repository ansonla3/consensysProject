<template>
  <section>
    <h2>Questionnaire Details</h2>
	<strong>*Please make sure to answer those questions before submit</strong>
    <div>
    <div v-for="(q, index) in questionLists" :key="q.number">
        <b-row>
			<b-col v-if="q.title">
				<b>Title: {{ q.title }}</b>
			</b-col>
            <b-col v-else>
                <b>{{ q.number }}. {{ q.question }} </b>
                <input type="radio"  v-model="quest[index]"  v-bind:value="'YES'"> <label>YES</label>
                <input type="radio" v-model="quest[index]"  v-bind:value="'NO'"> <label>NO</label>

            </b-col>
        </b-row>
    </div>
   
   <div v-if="isDisplay == true" v-for="(response, index) in responseCounter" :key="response[index]">
	   <b-row>
		    Question {{ index + 1 }}.
			<b-col>
				Yes: {{ response.YES}}
				No: {{ response.NO}}
			</b-col>
	   </b-row>
	</div>

    <button :disabled="this.isCompleted == true" @click="submitResponse()">Submit</button>

    <button :disabled="this.isClaimAllowed == false" @click="getRewards()">Get Rewards</button>

    <button :disabled="this.isCompleted == false" @click="showQuestionnaireResult()">Get Response</button>
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
            questionLists: [],
            questionnaire: {},
			responseCounter: [{"YES":0, "NO":0}, {"YES":0, "NO":0}, {"YES":0, "NO":0}],
			web3Instance: this.$store.state.web3Instance,
			QuestionContract: null,
			isClaimAllowed: false,
			isCompleted: false,
			isDisplay: false,
			currentAccount: '',
		}
    },
    async mounted() {
        const { questionnaire } = this.$route.query
        this.questionnaire = questionnaire

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

				this.renderQuestions()
				this.isRewardClaimAvailable()
				this.isSubmitQuestionnaireAvailable()
			}
		} else {
			alert('Please install Metamask extension!')
			// fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
			// window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
		}  
    },
    
	methods: {
        async showQuestionnaireResult() {
			this.isDisplay = true
			const responseCount = await this.QuestionContract.methods.getQuestionnairesCount(this.questionnaire.questionnaireKey).call()
			for (let i=0; i<responseCount; i++) {
				let getQuestionnairesResponse = await this.QuestionContract.methods.getQuestionnairesResponse(this.questionnaire.questionnaireKey, i).call()
				const response = await this.$axios.$get(`${config.IPFS_END_POINT}/query/fetch/${getQuestionnairesResponse[1]}`)
				let q1 = response[1]
				let q2 = response[2]
				let q3 = response[3]

				if (q1 === "YES") {
					this.responseCounter[0].YES += 1;
				} else {
					this.responseCounter[0].NO += 1;
				}

				if (q2 === "YES") {
					this.responseCounter[1].YES += 1;
				} else {
					this.responseCounter[1].NO += 1;
				}

				if (q3 === "YES") {
					this.responseCounter[2].YES += 1;
				} else {
					this.responseCounter[2].NO += 1;
				}
			}
        },
        async renderQuestions() {            
            const getQuestionsResponse = await this.$axios.$get(`${config.IPFS_END_POINT}/query/fetch/${this.questionnaire.question.questionIpfsHash}`)
			this.questionLists = getQuestionsResponse
		},
		async isRewardClaimAvailable() {
			const questionnaire = await this.QuestionContract.methods.questionnaireStruct(this.questionnaire.questionnaireKey).call()
			if (questionnaire.isCompleted && questionnaire.numOfRewardClaimed < questionnaire.actualParticipants) {
				this.isClaimAllowed = true
			}
		},
		async isSubmitQuestionnaireAvailable() {
			const questionnaire = await this.QuestionContract.methods.questionnaireStruct(this.questionnaire.questionnaireKey).call()
			this.isCompleted = questionnaire.isCompleted
		},
        async getRewards() {
			// Check the questionnaire status
			const questionnaire = await this.QuestionContract.methods.questionnaireStruct(this.questionnaire.questionnaireKey).call()
			if (questionnaire.isCompleted && questionnaire.numOfRewardClaimed < questionnaire.actualParticipants) {
				const currentAccount = await this.$store.state.web3Instance.currentAccount

				const result = await this.QuestionContract.methods.cliamRewards(this.questionnaire.questionnaireKey)
								.send({ from: currentAccount })
				this.showClaimSuccess()
				this.goToMainPage()
			} else {
				console.log("Claim is not allowed")
			}
        },
        async submitResponse() {   
            const { hash } = await this.$axios.$post(`${config.IPFS_END_POINT}/json/store`, 
                this.quest
			)
			
			const currentAccount = await this.$store.state.web3Instance.currentAccount
			this.showBeforeSubmit()
			const result = await this.QuestionContract.methods.submitResponse(this.questionnaire.questionnaireKey, hash)
						.send({ from: currentAccount })
			
			this.showSubmitSuccess()
			this.goToMainPage()
		},
		goToMainPage() {
			setTimeout(() => { 
				window.location.href = '/'
			}, 5000);
		}
	},
	notifications: {
		showClaimInfo: {
			title: 'All Rewards has been claimed',
			message: 'All participants claimed already.',
			type: 'info'
		},
		showClaimSuccess: {
			title: 'Reward Claim is submitted successfully',
			message: 'You will be rediteced to the main page after 5 seconds',
			type: 'success'
		},
		showBeforeSubmit: {
			title: 'Your are submitting a response',
			message: 'Please confirm the transaction & wait until you see the next notification',
			type: 'info'
		},
		showSubmitSuccess: { 
			title: 'Response is submitted successfully',
			message: 'You will be rediteced to the main page after 5 seconds',
			type: 'success'
		}
	}
}
</script>

<style>
</style>



// this.QuestionContract.methods.submitResponse(this.questionnaire.questionnaireKey, hash)
// .send({ from: currentAccount })
// .on('transactionHash', function(hash){
// 	console.log('Tx Hash:', hash)
// })
// .on('confirmation', function(confirmationNumber, receipt){
// 	console.log('Confirm number :', confirmationNumber)
// })
// .on('receipt', function(receipt){
// 	// receipt example
// 	console.log('Receipt :', receipt)
// })