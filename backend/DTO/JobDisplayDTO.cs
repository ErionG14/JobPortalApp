namespace backend.DTO;

public class JobDisplayDTO
{
    public int Id { get; set; }
    
    public string Title { get; set; }
    
    public string Description { get; set; }
    
    public string Location { get; set; }
    
    public string EmploymentType { get; set; }
    
    public decimal? SalaryMin { get; set; }
    
    public decimal? SalaryMax { get; set; }
    
    public string CompanyName { get; set; }
    
    public DateTime PostedDate { get; set; }
    
    public DateTime ApplicationDeadline { get; set; }
    
    public string ManagerId { get; set; }
    
    public string ManagerUserName { get; set; }
    
    public string ManagerName { get; set; }
    
    public string ManagerSurname { get; set; }
    
    public string? ManagerImage { get; set; }
}