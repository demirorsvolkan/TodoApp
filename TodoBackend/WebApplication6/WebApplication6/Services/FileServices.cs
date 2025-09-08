using ClosedXML.Excel;
using DocumentFormat.OpenXml.Bibliography;
using DocumentFormat.OpenXml.Drawing;
using DocumentFormat.OpenXml.Office2010.Excel;
using DocumentFormat.OpenXml.Office2021.DocumentTasks;
using DocumentFormat.OpenXml.Presentation;
using DocumentFormat.OpenXml.Spreadsheet;
using DocumentFormat.OpenXml.Wordprocessing;
using Microsoft.IdentityModel.Tokens;
using Swashbuckle.AspNetCore.SwaggerGen;
using System.Security.Cryptography;
using System.Threading.Tasks;
using WebApplication6.Dto;
using WebApplication6.Repository;

namespace WebApplication6.Services
{
    public class FileServices : IFileServices
    {
        private readonly Dictionary<string, Type> _headers = new Dictionary<string, Type>
{
    { "Görev Adı", typeof(string) },
    { "Görev Açıklaması", typeof(string) },
    { "Öncelik", typeof(string) },
    { "Aktiflik", typeof(bool) },
    { "Bitiş Tarihi", typeof(DateTime) },
    { "Son Güncelleme", typeof(DateTime) },
    { "Oluşturulma", typeof(DateTime) }
};
        private readonly ISubTaskServices _subTaskServices;
        public FileServices(ISubTaskServices subTaskServices)
        {
            _subTaskServices = subTaskServices;
        }

        public async Task<byte[]> GetTaskListFileAsync(List<IResponse> taskList, TaskDto? mainTask, string userId, bool withSub)
        {
            var workbook = new XLWorkbook();


            if (!withSub) 
            {
                var worksheet = workbook.Worksheets.Add("TaskList");
                FillWorksheet(worksheet, taskList, mainTask);
            }
            else
            {
                int sheetNumber = 1;
                foreach (var task in taskList.OfType<TaskDto>().ToList())
                {
                    if (_subTaskServices != null)
                    {
                        var subList = await _subTaskServices.ListTasks(task.Id, userId);
                        if (subList.IsNullOrEmpty<SubTaskDto>())
                            subList = new List<SubTaskDto>();
                        var worksheet = workbook.Worksheets.Add($"Görev{sheetNumber}");
                        FillWorksheet(worksheet, subList.OfType<IResponse>().ToList(), task);
                        sheetNumber++;
                    }
                }
            }

            using var ms = new MemoryStream();
            workbook.SaveAs(ms);
            return ms.ToArray();

        }





        private void FillWorksheet(IXLWorksheet worksheet, List<IResponse> taskList, TaskDto? mainTask)
        {
            var tasks = taskList.OfType<TaskDto>().ToList();
            var subTasks = taskList.OfType<SubTaskDto>().ToList();

            worksheet.Style.Font.SetFontName("Arial");
            worksheet.Row(1).Style.Font.SetFontSize(12);

            void ApplyCustomStyle(IXLCell cell)
            {
                cell.Style.Fill.BackgroundColor = XLColor.LightGray;
                cell.Style.Font.Bold = true;
                cell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                cell.Style.Border.TopBorder = XLBorderStyleValues.Medium;
                cell.Style.Border.RightBorder = XLBorderStyleValues.Medium;
                cell.Style.Border.BottomBorder = XLBorderStyleValues.Medium;
                cell.Style.Border.LeftBorder = XLBorderStyleValues.Medium;
            }

            var list = _headers.Keys.ToList();
            worksheet.Cell("A1").Value = list[0];
            worksheet.Cell("B1").Value = list[1];
            worksheet.Cell("C1").Value = list[2];
            worksheet.Cell("D1").Value = list[3];
            worksheet.Cell("E1").Value = list[4];
            worksheet.Cell("F1").Value = list[5];
            worksheet.Cell("G1").Value = list[6];

            worksheet.Column("A").Width = 30;
            worksheet.Column("B").Width = 30;
            worksheet.Column("C").Width = 15;
            worksheet.Column("D").Width = 15;
            worksheet.Column("E").Width = 20;
            worksheet.Column("F").Width = 20;
            worksheet.Column("G").Width = 20;

            ApplyCustomStyle(worksheet.Cell("A1"));
            ApplyCustomStyle(worksheet.Cell("B1"));
            ApplyCustomStyle(worksheet.Cell("C1"));
            ApplyCustomStyle(worksheet.Cell("D1"));
            ApplyCustomStyle(worksheet.Cell("E1"));
            ApplyCustomStyle(worksheet.Cell("F1"));
            ApplyCustomStyle(worksheet.Cell("G1"));



            var range = worksheet.Range("A1:G2");
            var table = range.CreateTable();
            table.Name = "Tasks";
            table.ShowAutoFilter = false;
            table.Theme = XLTableTheme.TableStyleLight20;

            int i = 2;
            var count = 0;
            if (tasks.Count > 0)
            {
                count = tasks.Count;
                foreach (var task in tasks)
                {
                    var newRow = table.Row(i);
                    newRow.Cell(1).Value = task.Name;
                    newRow.Cell(2).Value = task.Description;
                    newRow.Cell(3).Value = task.Priority;
                    newRow.Cell(4).Value = task.Active ? "True" : "False";
                    newRow.Cell(5).Value = task.Deadline;
                    newRow.Cell(6).Value = task.UpdateTime;
                    newRow.Cell(7).Value = task.CreationTime;
                    i++;
                }
            }
            else if (subTasks.Count > 0)
            {
                count = subTasks.Count;

                foreach (var task in subTasks)
                {
                    var newRow = table.Row(i);
                    newRow.Cell(1).Value = task.Name;
                    newRow.Cell(2).Value = task.Description;
                    newRow.Cell(3).Value = task.Priority;
                    newRow.Cell(4).Value = task.Active ? "True" : "False";
                    newRow.Cell(5).Value = task.Deadline;
                    newRow.Cell(6).Value = task.UpdateTime;
                    newRow.Cell(7).Value = task.CreationTime;
                    i++;
                }
            }
            else
            {
                var newRow = table.Row(i);
                newRow.Cell(1).Value = "Boş!";
                newRow.Cell(2).Value = "Boş!";
                newRow.Cell(3).Value = "Boş!";
                newRow.Cell(4).Value = "Boş!";
                newRow.Cell(5).Value = "Boş!";
                newRow.Cell(6).Value = "Boş!";
                newRow.Cell(7).Value = "Boş!";
            }

            if (count > 0)
            {
                var rangeString = $"A1:G{count + 1}";
                table.Resize(rangeString);
            }


            if (mainTask != null)
            {
                worksheet.Row(1).InsertRowsAbove(2);


                worksheet.Cell("A1").Value = mainTask.Name;
                worksheet.Cell("B1").Value = mainTask.Description;
                worksheet.Cell("C1").Value = mainTask.Priority;
                worksheet.Cell("D1").Value = mainTask.Active ? "True" : "False"; ;
                worksheet.Cell("E1").Value = mainTask.Deadline;
                worksheet.Cell("F1").Value = mainTask.UpdateTime;
                worksheet.Cell("G1").Value = mainTask.CreationTime;

                worksheet.Cell("A1").Style.Font.Bold = true;
                worksheet.Cell("B1").Style.Font.Bold = true;
                worksheet.Cell("C1").Style.Font.Bold = true;
                worksheet.Cell("D1").Style.Font.Bold = true;
                worksheet.Cell("E1").Style.Font.Bold = true;
                worksheet.Cell("F1").Style.Font.Bold = true;
                worksheet.Cell("G1").Style.Font.Bold = true;

                worksheet.Row(1).InsertRowsAbove(1);
                worksheet.Range(1, 1, 1, 7).Merge();
                worksheet.Cell(1, 1).Value = "Ana Görev";
                ApplyCustomStyle(worksheet.Cell(1, 1));
                ApplyCustomStyle(worksheet.Cell(1, 2));
                ApplyCustomStyle(worksheet.Cell(1, 3));
                ApplyCustomStyle(worksheet.Cell(1, 4));
                ApplyCustomStyle(worksheet.Cell(1, 5));
                ApplyCustomStyle(worksheet.Cell(1, 6));
                ApplyCustomStyle(worksheet.Cell(1, 7));

            }

            var dateRange = worksheet.Range("E2:G100");
            dateRange.Style.DateFormat.Format = "dd/MM/yyyy HH:mm";

            }




























        /*

        public byte[] GetTaskListFile(List<IResponse> taskList, TaskDto? mainTask)
        {
            var tasks = taskList.OfType<TaskDto>().ToList();
            var subTasks = taskList.OfType<SubTaskDto>().ToList();
            using var workbook = new XLWorkbook();
            var worksheet = workbook.Worksheets.Add("TaskList");

            worksheet.Style.Font.SetFontName("Arial");
            worksheet.Row(1).Style.Font.SetFontSize(12);

            void ApplyCustomStyle(IXLCell cell)
            {
                cell.Style.Fill.BackgroundColor = XLColor.LightGray;
                cell.Style.Font.Bold = true;
                cell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                cell.Style.Border.TopBorder = XLBorderStyleValues.Medium;
                cell.Style.Border.RightBorder = XLBorderStyleValues.Medium;
                cell.Style.Border.BottomBorder = XLBorderStyleValues.Medium;
                cell.Style.Border.LeftBorder = XLBorderStyleValues.Medium;
            }

            var list = _headers.Keys.ToList();
            worksheet.Cell("A1").Value = list[0];
            worksheet.Cell("B1").Value = list[1];
            worksheet.Cell("C1").Value = list[2];
            worksheet.Cell("D1").Value = list[3];
            worksheet.Cell("E1").Value = list[4];
            worksheet.Cell("F1").Value = list[5];
            worksheet.Cell("G1").Value = list[6];

            worksheet.Column("A").Width = 30;
            worksheet.Column("B").Width = 30;
            worksheet.Column("C").Width = 15;
            worksheet.Column("D").Width = 15;
            worksheet.Column("E").Width = 20;
            worksheet.Column("F").Width = 20;
            worksheet.Column("G").Width = 20;

            ApplyCustomStyle(worksheet.Cell("A1"));
            ApplyCustomStyle(worksheet.Cell("B1"));
            ApplyCustomStyle(worksheet.Cell("C1"));
            ApplyCustomStyle(worksheet.Cell("D1"));
            ApplyCustomStyle(worksheet.Cell("E1"));
            ApplyCustomStyle(worksheet.Cell("F1"));
            ApplyCustomStyle(worksheet.Cell("G1"));



            var range = worksheet.Range("A1:G2");
            var table = range.CreateTable();
            table.Name = "Tasks";
            table.ShowAutoFilter = false;
            table.Theme = XLTableTheme.TableStyleLight20;

            int i = 2;
            var count = 0;
            if (tasks.Count > 0)
            {
                count=tasks.Count;
                foreach (var task in tasks)
                {
                    var newRow = table.Row(i);
                    newRow.Cell(1).Value = task.Name;
                    newRow.Cell(2).Value = task.Description;
                    newRow.Cell(3).Value = task.Priority;
                    newRow.Cell(4).Value = task.Active ? "True" : "False";
                    newRow.Cell(5).Value = task.Deadline;
                    newRow.Cell(6).Value = task.UpdateTime;
                    newRow.Cell(7).Value = task.CreationTime;
                    i++;
                }
            }
            else if (subTasks.Count > 0) {
                count = subTasks.Count;

                foreach (var task in subTasks)
                {
                    var newRow = table.Row(i);
                    newRow.Cell(1).Value = task.Name;
                    newRow.Cell(2).Value = task.Description;
                    newRow.Cell(3).Value = task.Priority;
                    newRow.Cell(4).Value = task.Active ? "True" : "False";
                    newRow.Cell(5).Value = task.Deadline;
                    newRow.Cell(6).Value = task.UpdateTime;
                    newRow.Cell(7).Value = task.CreationTime;
                    i++;
                }
            }
            else
            {
                var newRow = table.Row(i);
                newRow.Cell(1).Value = "Bir hata oluştu!";
            }

            var rangeString = $"A1:G{count+1}";
            table.Resize(rangeString);

            if (mainTask != null)
            {
                worksheet.Row(1).InsertRowsAbove(2);


                worksheet.Cell("A1").Value = mainTask.Name;
                worksheet.Cell("B1").Value = mainTask.Description;
                worksheet.Cell("C1").Value = mainTask.Priority;
                worksheet.Cell("D1").Value = mainTask.Active ? "True" : "False"; ;
                worksheet.Cell("E1").Value = mainTask.Deadline;
                worksheet.Cell("F1").Value = mainTask.UpdateTime;
                worksheet.Cell("G1").Value = mainTask.CreationTime;

                worksheet.Cell("A1").Style.Font.Bold = true;
                worksheet.Cell("B1").Style.Font.Bold = true;
                worksheet.Cell("C1").Style.Font.Bold = true;
                worksheet.Cell("D1").Style.Font.Bold = true;
                worksheet.Cell("E1").Style.Font.Bold = true;
                worksheet.Cell("F1").Style.Font.Bold = true;
                worksheet.Cell("G1").Style.Font.Bold = true;

                worksheet.Row(1).InsertRowsAbove(1);
                worksheet.Range(1, 1, 1, 7).Merge();
                worksheet.Cell(1, 1).Value = "Ana Görev";
                ApplyCustomStyle(worksheet.Cell(1, 1));
                ApplyCustomStyle(worksheet.Cell(1, 2));
                ApplyCustomStyle(worksheet.Cell(1, 3));
                ApplyCustomStyle(worksheet.Cell(1, 4));
                ApplyCustomStyle(worksheet.Cell(1, 5));
                ApplyCustomStyle(worksheet.Cell(1, 6));
                ApplyCustomStyle(worksheet.Cell(1, 7));

            }

            var dateRange = worksheet.Range("E2:G100");
            dateRange.Style.DateFormat.Format = "dd/MM/yyyy HH:mm";


            using var ms = new MemoryStream();
            workbook.SaveAs(ms);
            return ms.ToArray();
        }
        */

        public Dictionary<int, List<int>> CheckFile(IFormFile file)
        {
            var errors = new Dictionary<int, List<int>>();
            using (var stream = file.OpenReadStream())
            using (var workbook = new XLWorkbook(stream))
            {
                var worksheet = workbook.Worksheet(1);
                var table = worksheet.Tables.FirstOrDefault(t => t.Name == "Tasks");
                if (table == null)
                {
                    errors[0] = new List<int> { -1 };
                    return errors;
                }
                if (!IsHeaderOk(worksheet))
                {
                    int headerRow = table.FirstRow().RowNumber();
                    errors[headerRow] = new List<int> { 1, 2, 3, 4, 5 };
                    return errors;
                }
                foreach (var row in table.DataRange.Rows())
                {
                    if (row.Equals(table.DataRange.FirstRow()))
                        continue;
                    var invalidColumns = IsRowOk(row);
                    if (invalidColumns != null && invalidColumns.Any() && invalidColumns.Count != 5)
                    {
                        errors[row.RowNumber()] = invalidColumns.ToList();
                    }
                }
            }
            return errors;
        }

        private bool IsHeaderOk(IXLWorksheet worksheet)
        {
            var table = worksheet.Tables.FirstOrDefault(t => t.Name == "Tasks");
            if (table == null)
                return false;

            var actualHeaders = table.Fields.Select(f => f.Name.Trim()).ToList();
            var expectedHeaders = _headers.Keys.ToList();
            if (actualHeaders.Count != expectedHeaders.Count)
                return false;
            for (int i = 0; i < expectedHeaders.Count; i++)
            {
                if (!string.Equals(actualHeaders[i], expectedHeaders[i], StringComparison.OrdinalIgnoreCase))
                    return false;
            }
            return true;
        }

        private List<int> IsRowOk(IXLRangeRow row)
        {
            List<int> errors = new List<int>();

            for (int i = 1; i <= 5; i++)
            {
                var cell = row.Cell(i);
                var dataType = cell.DataType;
                var value = cell.GetString();

                if (string.IsNullOrWhiteSpace(value))
                {
                    errors.Add(-i);
                    continue;
                }
                switch (i)
                {
                    case 1:
                        if (dataType != XLDataType.Text)
                            errors.Add(i);
                        break;

                    case 2:
                        if (dataType != XLDataType.Text)
                            errors.Add(i);
                        break;

                    case 3:
                        if (dataType != XLDataType.Text)
                        {
                            errors.Add(i);
                            break;
                        }
                        var priority = value.ToLowerInvariant();
                        if (priority != "high" && priority != "medium" && priority != "low")
                            errors.Add(i);
                        break;

                    case 4:
                        if (dataType != XLDataType.Text)
                        {
                            errors.Add(i);
                            break;
                        }
                        if (!bool.TryParse(value, out _))
                            errors.Add(i);
                        break;
                    case 5:
                        if (dataType != XLDataType.DateTime)
                            errors.Add(i);
                        break;
                }
            }
            return errors;
        }

        public List<IResponse> ReadFile(IFormFile file, int? mainTaskId, int? categoryId)
        {
            bool isSubTask = mainTaskId.HasValue;
            var list = new List<IResponse>();
            using var stream = file.OpenReadStream();
            using var workbook = new XLWorkbook(stream);
            var worksheet = workbook.Worksheet(1);

            var table = worksheet.Tables.FirstOrDefault(t => t.Name == "Tasks");
            if (table == null)
                return list;

            foreach (var row in table.DataRange.Rows())
            {
                if (row.RowNumber() == table.FirstRow().RowNumber())
                    continue;
                if(IsRowOk(row).Sum()==-15)
                    continue;

                var name = string.IsNullOrWhiteSpace(row.Cell(1).GetString()) ? "Tanımlanmamış İsim" : row.Cell(1).GetString();
                var description = string.IsNullOrWhiteSpace(row.Cell(2).GetString()) ? "Tanımlanmamış Açıklama" : row.Cell(2).GetString();
                var priority = string.IsNullOrWhiteSpace(row.Cell(3).GetString()) ? "low" : row.Cell(3).GetString();
                bool active = bool.TryParse(row.Cell(4).GetString(), out bool activeVal) ? activeVal : true;
                DateTime deadline = row.Cell(5).TryGetValue<DateTime>(out DateTime dt) && dt != default(DateTime) ? dt : new DateTime(2100, 1, 1, 0, 0, 0);


                if (isSubTask)
                {
                    var subTask = new SubTaskDto
                    {
                        MainTaskId = mainTaskId.Value,
                        Name = name,
                        Description = description,
                        Priority = priority,
                        Active = active,
                        Deadline = deadline
                    };
                    list.Add(subTask);
                }
                else
                {
                    var task = new TaskDto
                    {
                        CategoryId= (categoryId.HasValue) ? categoryId.Value : 1,
                        Name = name,
                        Description = description,
                        Priority = priority,
                        Active = active,
                        Deadline = deadline
                    };
                    list.Add(task);
                }
            }
            return list;
        }

        public byte[] CreateTemplate()
        {
            using var workbook = new XLWorkbook();
            var worksheet = workbook.Worksheets.Add("TaskTemplate");

            worksheet.Style.Font.SetFontName("Arial");
            worksheet.Row(1).Style.Font.SetFontSize(12);

            var list = _headers.Keys.ToList();
            worksheet.Cell("A1").Value = list[0];
            worksheet.Cell("B1").Value = list[1];
            worksheet.Cell("C1").Value = list[2];
            worksheet.Cell("D1").Value = list[3];
            worksheet.Cell("E1").Value = list[4];

            worksheet.Cell("H3").Value = list[0];
            worksheet.Cell("I3").Value = list[1];
            worksheet.Cell("J3").Value = list[2];
            worksheet.Cell("K3").Value = list[3];
            worksheet.Cell("L3").Value = list[4];
            worksheet.Cell("G8").Value = "Default";

            void ApplyCustomStyle(IXLCell cell)
            {
                cell.Style.Fill.BackgroundColor = XLColor.LightGray;
                cell.Style.Font.Bold = true;
                cell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                cell.Style.Border.TopBorder = XLBorderStyleValues.Medium;
                cell.Style.Border.RightBorder = XLBorderStyleValues.Medium;
                cell.Style.Border.BottomBorder = XLBorderStyleValues.Medium;
                cell.Style.Border.LeftBorder = XLBorderStyleValues.Medium;
            }

            ApplyCustomStyle(worksheet.Cell("A1"));
            ApplyCustomStyle(worksheet.Cell("B1"));
            ApplyCustomStyle(worksheet.Cell("C1"));
            ApplyCustomStyle(worksheet.Cell("D1"));
            ApplyCustomStyle(worksheet.Cell("E1"));
            ApplyCustomStyle(worksheet.Cell("H3"));
            ApplyCustomStyle(worksheet.Cell("I3"));
            ApplyCustomStyle(worksheet.Cell("J3"));
            ApplyCustomStyle(worksheet.Cell("K3"));
            ApplyCustomStyle(worksheet.Cell("L3"));
            ApplyCustomStyle(worksheet.Cell("G8"));

            worksheet.Column("A").Width = 30;
            worksheet.Column("B").Width = 30;
            worksheet.Column("C").Width = 15;
            worksheet.Column("D").Width = 15;
            worksheet.Column("E").Width = 20;
            worksheet.Column("H").Width = 30;
            worksheet.Column("I").Width = 30;
            worksheet.Column("J").Width = 15;
            worksheet.Column("G").Width = 15;
            worksheet.Column("K").Width = 15;
            worksheet.Column("L").Width = 20;

            var dateRange = worksheet.Range("E2:E100");
            dateRange.Style.DateFormat.Format = "dd/MM/yyyy HH:mm";


            worksheet.Cell("H4").Value = "örnek";
            worksheet.Cell("H8").Value = "Tanımlanmamış İsim";

            worksheet.Cell("I4").Value = "örnek";
            worksheet.Cell("I8").Value = "Tanımlanmamış Açıklama";

            worksheet.Cell("J4").Value = "high";
            worksheet.Cell("J5").Value = "medium";
            worksheet.Cell("J6").Value = "low";
            worksheet.Cell("J8").Value = "low";

            worksheet.Cell("K4").Value = "true";
            worksheet.Cell("K5").Value = "false";
            worksheet.Cell("K8").Value = "true";

            worksheet.Cell("L4").Value = "dd/MM/yyyy HH:mm";
            worksheet.Cell("L8").Value = "01/01/2100 00:00";

            var range = worksheet.Range("A1:E2");
            var table = range.CreateTable();
            table.Name = "Tasks";
            table.ShowAutoFilter = false;

            var vRange = worksheet.Range("H3:L8");
            var vTable = vRange.CreateTable();
            vTable.Name = "Validations";
            vTable.ShowAutoFilter = false;

            table.Theme = XLTableTheme.TableStyleLight20;
            vTable.Theme = XLTableTheme.TableStyleLight20;

            using var stream = new MemoryStream();
            workbook.SaveAs(stream);
            return stream.ToArray();
        }

    }
}
