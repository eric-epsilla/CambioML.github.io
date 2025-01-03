import axios, { AxiosError, AxiosResponse } from 'axios';
import { PlaygroundFile, ExtractState, TransformState } from '@/app/types/PlaygroundTypes';
import pollJobStatus from './pollJobStatus';
import toast from 'react-hot-toast';
import { JobParams, QueryParams, PresignedResponse } from './apiInterface';

interface IParams {
  apiURL: string;
  jobType: string;
  userId: string;
  clientId: string;
  fileId: string;
  fileData: PresignedResponse;
  selectedFile: PlaygroundFile;
  token: string;
  sourceType: string;
  selectedFileIndex: number;
  url?: string;
  jobParams?: JobParams;
  filename: string;
  customSchema?: string[];
  handleSuccess: (response: AxiosResponse) => void;
  handleError: (e: AxiosError) => void;
  handleTimeout: () => void;
  updateFileAtIndex: (
    index: number | null,
    property: string,
    value: string | ExtractState | TransformState | File
  ) => void;
}

const JOB_STATE: { [key: string]: string } = {
  file_extraction: 'extractState',
  info_extraction: 'keyValueState',
  instruction_extraction: 'instructionExtractionState',
  qa_generation: 'qaState',
};

const SUCCESS_STATE: { [key: string]: ExtractState | TransformState } = {
  file_extraction: ExtractState.EXTRACTING,
  instruction_extraction: ExtractState.EXTRACTING,
  info_extraction: TransformState.TRANSFORMING,
  qa_generation: TransformState.TRANSFORMING,
};

// const FAIL_STATE: { [key: string]: ExtractState | TransformState } = {
//   file_extraction: ExtractState.READY,
//   instruction_extraction: ExtractState.READY,
//   info_extraction: TransformState.READY,
//   qa_generation: TransformState.READY,
// };

const SLEEP_DURATION: { [key: string]: number } = {
  file_extraction: 5000,
  info_extraction: 5000,
  instruction_extraction: 5000,
  qa_generation: 5000,
  schema_extraction: 5000,
  schema_extraction_frontend: 5000,
};

export const runAsyncRequestJob = async ({
  apiURL,
  userId,
  fileId,
  fileData,
  selectedFile,
  jobParams,
  jobType,
  selectedFileIndex,
  filename,
  token,
  handleError,
  handleSuccess,
  handleTimeout,
  updateFileAtIndex,
}: IParams) => {
  const postData = new FormData();
  Object.entries(fileData.presignedUrl.fields).forEach(([key, value]) => {
    postData.append(key, value);
  });
  postData.append('file', selectedFile.file);
  return axios
    .post(fileData.presignedUrl.url, postData, {
      timeout: 30000, // 30 seconds
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    .then((response) => {
      if (response.status === 204) {
        toast.success(`${filename} submitted!`);
        updateFileAtIndex(selectedFileIndex, JOB_STATE[jobType], SUCCESS_STATE[jobType]);
        const postParams: QueryParams = {
          userId,
          fileId,
          jobId: '-',
          queryType: 'job_result',
        };
        setTimeout(() => {
          pollJobStatus({
            api_url: apiURL,
            apiKey: '-',
            postParams,
            token,
            handleSuccess,
            handleError,
            handleTimeout,
            targetPages: jobParams?.targetPageNumbers,
          });
        }, SLEEP_DURATION[jobType]); // Need to delay the polling to give the server time to process the file
      } else {
        throw new Error(`Error uploading file: ${filename}. Please try again.`);
      }
    })
    .catch((error) => {
      toast.error(`Error uploading file: ${filename}. Please try again.`);
      return error;
    });
};
