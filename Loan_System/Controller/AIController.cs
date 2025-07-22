// // Controllers/AIController.cs
// using Microsoft.AspNetCore.Mvc;

// [ApiController]
// [Route("api/[controller]")]
// public class AIController : ControllerBase
// {
//     private readonly SemanticKernelService _sk;

//     public AIController(SemanticKernelService sk)
//     {
//         _sk = sk;
//     }
// [HttpPost("contract-summary")]
// public async Task<IActionResult> ContractSummary([FromBody] TextInput input)
//     => Ok(await _sk.GetContractSummaryAsync(input.Text));

// [HttpPost("key-points")]
// public async Task<IActionResult> KeyPoints([FromBody] TextInput input)
//     => Ok(await _sk.ExtractKeyPointsAsync(input.Text));

// [HttpPost("improvements")]
// public async Task<IActionResult> Improvements([FromBody] TextInput input)
//     => Ok(await _sk.SuggestImprovementsAsync(input.Text));

// [HttpPost("chat")]
// public async Task<IActionResult> Chat([FromBody] TextInput input)
//     => Ok(await _sk.ChatAsync(input.Text));

// public class TextInput
// {
//     public string Text { get; set; }
// }


// }
