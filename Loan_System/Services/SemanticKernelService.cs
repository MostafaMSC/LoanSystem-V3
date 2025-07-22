// using Microsoft.SemanticKernel;

// public class SemanticKernelService
// {
//     private readonly Kernel _kernel;
// private readonly KernelFunction _contractSummaryFunction;
// private readonly KernelFunction _keyPointsFunction;
// private readonly KernelFunction _improvementsFunction;
// private readonly KernelFunction _chatFunction;

//     public SemanticKernelService(IConfiguration config)
//     {
//         var apiKey = config["OpenAI:ApiKey"];
//         var model = config["OpenAI:Model"] ?? "gpt-3.5-turbo";

//         _kernel = Kernel.CreateBuilder()
//             .AddOpenAIChatCompletion(model, apiKey)
//             .Build();
// _contractSummaryFunction = _kernel.CreateFunctionFromPrompt("Summarize this contract: {{$input}}", functionName: "ContractSummary");
// _keyPointsFunction = _kernel.CreateFunctionFromPrompt("List the key points, obligations, and risks from this contract: {{$input}}", functionName: "KeyPoints");
// _improvementsFunction = _kernel.CreateFunctionFromPrompt("Suggest improvements or corrections to this contract: {{$input}}", functionName: "Improvements");
// _chatFunction = _kernel.CreateFunctionFromPrompt("You are an AI assistant for a loan system. Answer the user query clearly: {{$input}}", functionName: "Chat");

//     }

// public async Task<string> GetContractSummaryAsync(string contractText)
// {
//     var result = await _kernel.InvokeAsync(_contractSummaryFunction, new KernelArguments { ["input"] = contractText });
//     return result.GetValue<string>();
// }

// public async Task<string> ExtractKeyPointsAsync(string contractText)
// {
//     var result = await _kernel.InvokeAsync(_keyPointsFunction, new KernelArguments { ["input"] = contractText });
//     return result.GetValue<string>();
// }

// public async Task<string> SuggestImprovementsAsync(string contractText)
// {
//     var result = await _kernel.InvokeAsync(_improvementsFunction, new KernelArguments { ["input"] = contractText });
//     return result.GetValue<string>();
// }

// public async Task<string> ChatAsync(string message)
// {
//     var result = await _kernel.InvokeAsync(_chatFunction, new KernelArguments { ["input"] = message });
//     return result.GetValue<string>();
// }


// }
