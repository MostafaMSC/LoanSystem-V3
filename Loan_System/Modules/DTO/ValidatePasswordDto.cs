using System.ComponentModel.DataAnnotations;

public class ValidatePasswordDto
{
    [Required]
    public string Password { get; set; }
}
