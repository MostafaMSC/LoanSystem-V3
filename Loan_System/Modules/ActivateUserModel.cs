using System.ComponentModel.DataAnnotations;

public class ActivateUserModel
    {
        [Required]
        public string UserId { get; set; } = string.Empty;
    }