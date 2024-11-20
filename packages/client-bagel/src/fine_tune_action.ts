// fine_tune_action.ts
import { IAction } from './action_interface';
import BagelClient from '../providers/bagel_client';

class FineTuneAction implements IAction {
  async execute(context: any): Promise<void> {
    const { characterName } = context;
    const character = await context.characterLoader.loadCharacter(characterName);
    
    if (character.modelProvider === 'bagel') {
      const { baseModel, fineTuningData, fineTuningOptions } = character.modelSettings;
      
      const bagelClient = new BagelClient(process.env.BAGEL_API_KEY, process.env.BAGEL_SERVER_HOST);
      
      // Create an asset
      const assetPayload = {
        dataset_type: 'RAW',
        title: `${characterName}_dataset`,
        category: 'Fine-tuning Data',
        details: 'Dataset for fine-tuning',
        tags: [],
        user_id: process.env.BAGEL_USER_ID,
      };
      const assetId = await bagelClient.createAsset(assetPayload);
      
      // Upload fine-tuning data
      await bagelClient.uploadFile(assetId, fineTuningData);
      
      // Initiate fine-tuning
      const fineTunePayload = {
        dataset_type: 'MODEL',
        title: `${characterName}_model`,
        category: 'Fine-tuned Model',
        details: 'Fine-tuned model',
        tags: [],
        user_id: process.env.BAGEL_USER_ID,
        fine_tune_payload: {
          asset_id: assetId,
          model_name: `${characterName}_model`,
          base_model: baseModel,
          file_name: fineTuningData.split('/').pop(),
          user_id: process.env.BAGEL_USER_ID,
        },
      };
      const fineTunedModelId = await bagelClient.fineTune(fineTunePayload);
      
      // Monitor fine-tuning job
      let jobStatus = 'running';
      while (jobStatus === 'running') {
        const job = await bagelClient.getJobByAssetId(fineTunedModelId);
        jobStatus = job.status;
        await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait for 5 seconds
      }
      
      if (jobStatus === 'completed') {
        // Download fine-tuned model files
        const modelFiles = await bagelClient.listJobs(process.env.BAGEL_USER_ID);
        for (const file of modelFiles) {
          const fileContent = await bagelClient.downloadModelFile(fineTunedModelId, file.name);
          // Save the file content to the appropriate location
          // ...
        }
        
        // Update the character's model settings with the fine-tuned model
        character.modelSettings.modelId = fineTunedModelId;
        await context.characterLoader.saveCharacter(character);
        
        console.log(`Fine-tuning completed for character ${characterName}. Model ID: ${fineTunedModelId}`);
      } else {
        console.error(`Fine-tuning failed for character ${characterName}. Job status: ${jobStatus}`);
      }
    } else {
      console.warn(`Fine-tuning is not supported for the model provider of character ${characterName}`);
    }
  }
}

export default FineTuneAction;