using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace WebApplication6.Data
{
    public class SwaggerFileOperationFilter : IOperationFilter
    {
        public void Apply(OpenApiOperation operation, OperationFilterContext context)
        {
            var fileParams = context.MethodInfo.GetParameters()
                .Where(p => p.ParameterType == typeof(IFormFile))
                .ToList();

            if (!fileParams.Any())
                return;

            // requestBody içine file parametrelerini ekle
            operation.RequestBody = new OpenApiRequestBody
            {
                Content =
            {
                ["multipart/form-data"] = new OpenApiMediaType
                {
                    Schema = new OpenApiSchema
                    {
                        Type = "object",
                        Properties = fileParams.ToDictionary(
                            p => p.Name,
                            p => new OpenApiSchema { Type = "string", Format = "binary" }),
                        Required = fileParams.Select(p => p.Name).ToHashSet()
                    }
                }
            }
            };

            // Diğer parametreler (query/path) operation.Parameters'de kalmalı.
            // Sadece file parametrelerini kaldır
            foreach (var fileParam in fileParams)
            {
                var toRemove = operation.Parameters.FirstOrDefault(x => x.Name == fileParam.Name);
                if (toRemove != null)
                    operation.Parameters.Remove(toRemove);
            }
        }
    }


}
