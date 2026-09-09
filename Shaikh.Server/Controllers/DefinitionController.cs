using System.Linq;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Json;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;

namespace Shaikh.Server.Controllers
{
    [ApiController]
    [Route("api/definition")]
    public class DefinitionController : ControllerBase
    {
        private readonly HttpClient httpClient;
        public DefinitionController(IHttpClientFactory httpClientFactory)
        {
            httpClient = httpClientFactory.CreateClient();
            httpClient.DefaultRequestHeaders.UserAgent.ParseAdd("ShaikhPortfolio/1.0 (personal portfolio project)");
        }

        [HttpGet("{keyword}")]
        public async Task<IActionResult> GetDefinition(string keyword)
        {
            try
            {
                string url = $"https://en.wikipedia.org/api/rest_v1/page/summary/{keyword}";
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var result = await httpClient.GetFromJsonAsync<WikiResult>(url, options);

                string[] sentences = result.Extract.Split(". ");
                string firstThree = string.Join(". ", sentences.Take(3));
                return Ok(new { keyword, summary = firstThree });
            }
            catch (HttpRequestException)
            {
                return NotFound(new { message = $"No Wikipedia page found for \"{keyword}\"." });
            }
        }
    }

}

public class WikiResult
{
    public string Extract { get; set; }
}